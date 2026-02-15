import { MaterialIcons } from "@expo/vector-icons";
import { Picker as RNPickerSelect } from "@react-native-picker/picker";
import * as Speech from "expo-speech";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../../contexts/AuthContext";
import { useChatbot } from "../../../contexts/ChatbotContext";
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

const { width: screenWidth } = Dimensions.get("window");
const isLaptopScreen = screenWidth > 768;

const { width } = Dimensions.get("window");

const ChatBot = () => {
  const { chatbotConfig, isChatExpanded, setIsChatExpanded } = useChatbot();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! How are you feeling today? I’m your personal health companion — here to support you every step of the way. Would you like help with your heart health or reproductive health today? And remember, this is a safe and private space, so feel free to ask me anything.",
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [playingMessage, setPlayingMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const typingDots = new Animated.Value(0);
  const [typingText, setTypingText] = useState(".");
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const { user, role } = useContext(AuthContext);

  //Stop speaking when user refreshes the page
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

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
  }, [user]); // Trigger when user changes (logs in)

  // Loading Typing animation
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

      // Check if we just reached the limit
      if (newCount >= CHAT_LIMIT) {
        // Still allow this message but show popup after
        const messageToSend = userMessage;
        setUserMessage("");
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: messageToSend },
        ]);
        setIsLoading(true);

        try {
          const botReply = await askBot(
            user,
            role,
            messageToSend,
            selectedLanguage
          );
          if (botReply) {
            setMessages((prevMessages) => {
              const messageData = botReply.is_preview
                ? {
                    sender: "bot",
                    text: botReply.preview_text || botReply.full_text,
                    is_preview: true,
                    preview_text: botReply.preview_text,
                    full_text: botReply.full_text,
                    cta_text: botReply.cta_text,
                    signup_action: botReply.signup_action,
                  }
                : {
                    sender: "bot",
                    text: botReply.text,
                    is_preview: false,
                  };
              
              const updatedMessages = [...prevMessages, messageData];
              const newMessageIndex = updatedMessages.length - 1;
              setPlayingMessage(newMessageIndex);
              
              // Only speak if not preview (or speak preview text)
              const textToSpeak = botReply.is_preview
                ? botReply.preview_text || botReply.full_text
                : botReply.text;
              
              Speech.speak(textToSpeak, {
                language: selectedLanguage,
                onDone: () => setPlayingMessage(null),
                onStopped: () => setPlayingMessage(null),
              });
              return updatedMessages;
            });
          }
          // Show popup after sending the 5th message
          setShowSignInPopup(true);
        } catch (error) {
          console.error("Error communicating with Bot:", error);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: error.message },
          ]);
          setShowSignInPopup(true);
        }

        setIsLoading(false);
        Keyboard.dismiss();
        return;
      }
    }

    const messageToSend = userMessage;
    setUserMessage("");

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: messageToSend },
    ]);
    setIsLoading(true);

    try {
      const botReply = await askBot(
        user,
        role,
        messageToSend,
        selectedLanguage
      );

      if (botReply) {
        setMessages((prevMessages) => {
          const messageData = botReply.is_preview
            ? {
                sender: "bot",
                text: botReply.preview_text || botReply.full_text,
                is_preview: true,
                preview_text: botReply.preview_text,
                full_text: botReply.full_text,
                cta_text: botReply.cta_text,
                signup_action: botReply.signup_action,
              }
            : {
                sender: "bot",
                text: botReply.text,
                is_preview: false,
              };
          
          const updatedMessages = [...prevMessages, messageData];
          const newMessageIndex = updatedMessages.length - 1; // Get the index of the latest bot message
          setPlayingMessage(newMessageIndex); // Set playingMessage to the new message index
          
          // Only speak if not preview (or speak preview text)
          const textToSpeak = botReply.is_preview
            ? botReply.preview_text || botReply.full_text
            : botReply.text;
          
          Speech.speak(textToSpeak, {
            language: selectedLanguage,
            onDone: () => setPlayingMessage(null),
            onStopped: () => setPlayingMessage(null),
          });
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error communicating with Bot:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: error.message },
      ]);
    }

    setIsLoading(false);
    Keyboard.dismiss();
  };

  const toggleTTS = (index, text) => {
    if (playingMessage === index) {
      Speech.stop();
      setPlayingMessage(null);
    } else {
      Speech.speak(text, {
        language: selectedLanguage,
        onDone: () => setPlayingMessage(null),
        onStopped: () => setPlayingMessage(null),
      });
      setPlayingMessage(index);
    }
  };

  const renderItem = ({ item, index }) => {
    if (isLoading && index === messages.length) {
      return (
        <View style={[styles.messageContainer, styles.botMessage]}>
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
          styles.messageContainer,
          item.sender === "user" ? styles.userMessage : styles.botMessage,
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
            <FormattedMessageText sender={item.sender} text={item.text} />
          )}
          {item.sender === "bot" && !isLoading && !item.is_preview && (
            <View style={styles.botIcons}>
              <TouchableOpacity onPress={() => toggleTTS(index, item.text)}>
                <MaterialIcons
                  name={playingMessage === index ? "pause" : "volume-up"}
                  size={16}
                  color="gray"
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons name="thumb-up" size={16} color="gray" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons name="thumb-down" size={16} color="gray" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons name="share" size={16} color="gray" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleFocus = () => {
    setIsChatExpanded(true);
  };

  const handleBlur = () => {
    setIsChatExpanded(false);
    Keyboard.dismiss();
  };

  return (
    <View
      style={[
        styles.chatContainer,
        {
          height: isChatExpanded ? chatbotConfig.height || "50%" : "10%",
          left: chatbotConfig.left || "17%",
          // height: chatbotConfig.height || "40%",
          // left: chatbotConfig.left || "17%",
        },
      ]}
    >
      {isChatExpanded && (
        <>
          <View style={styles.languageSelector}>
            <Text style={{ alignSelf: "center" }}>
              Select the language in which you want to chat:{" "}
            </Text>
            <RNPickerSelect
              selectedValue={selectedLanguage}
              onValueChange={(itemValue) => {
                setSelectedLanguage(itemValue);
              }}
              style={styles.picker}
            >
              <RNPickerSelect.Item label="English" value="en" />
              <RNPickerSelect.Item label="Hindi" value="hi" />
              <RNPickerSelect.Item label="Spanish" value="es" />
              <RNPickerSelect.Item label="Telugu" value="te" />
            </RNPickerSelect>
            <Pressable onPress={() => handleBlur()} style={styles.closeIcon}>
              <MaterialIcons name="cancel" size={30} color="#000" />
            </Pressable>
          </View>
          <FlatList
            data={
              isLoading ? [...messages, { sender: "bot", text: "" }] : messages
            }
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.messageList}
          />
          {/* <View style={styles.chatInner}>
            <View style={styles.languageSelector}>
              <Text style={{ alignSelf: "center" }}>
                Select the language in which you want to chat:
              </Text>
              <RNPickerSelect
                selectedValue={selectedLanguage}
                onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                style={styles.picker}
              >
                <RNPickerSelect.Item label="English" value="en" />
                <RNPickerSelect.Item label="Hindi" value="hi" />
                <RNPickerSelect.Item label="Spanish" value="es" />
                <RNPickerSelect.Item label="Telugu" value="te" />
              </RNPickerSelect>
              <Pressable onPress={() => handleBlur()} style={styles.closeIcon}>
                <MaterialIcons name="cancel" size={30} color="#000" />
              </Pressable>
            </View>

            <FlatList
              data={
                isLoading
                  ? [...messages, { sender: "bot", text: "" }]
                  : messages
              }
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={true}
            />
          </View> */}
        </>
      )}

      <View style={styles.chatBox}>
        <TouchableOpacity>
          <MaterialIcons
            name="mic"
            size={24}
            color="black"
            style={styles.voiceIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Attach Photo")}>
          <Image
            source={require("../../../assets/Icons/photo.png")}
            style={styles.chatIcon}
          />
        </TouchableOpacity>
        <TextInput
          value={userMessage}
          onChangeText={setUserMessage}
          style={styles.input}
          onFocus={handleFocus}
          placeholderTextColor={"#aaa"}
          placeholder="Type your message..."
          onSubmitEditing={sendMessageToBot}
          enterKeyHint="send"
        />
        <TouchableOpacity onPress={sendMessageToBot}>
          <Image
            source={require("../../../assets/Icons/send.png")}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    width: "80%",
    minWidth: 300,
    borderWidth: 3,
    borderColor: "#6495ed",
    backgroundColor: "#fff",
    position: "absolute",
    left: "28%", // Center it dynamically
    bottom: "3%",
    borderRadius: 15,
    padding: 10,
    // position: "fixed", // stays visible while scrolling
    // bottom: "2%",
    // right: "3%", // or use left: "25%" if you prefer center-bottom
    // width: "80%",
    // minWidth: 350,
    // height: "40%",
    // backgroundColor: "#fff",
    // borderWidth: 2,
    // borderColor: "#6495ed",
    // borderRadius: 20,
    // padding: 10,
    // boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    // zIndex: 1000,
    // backdropFilter: "blur(6px)",
    // overflow: "hidden",
  },
  //   chatInner: {
  //   flex: 1,
  //   overflow: "scroll",
  // },

  messageList: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  chatBox: {
    height: 50,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    paddingHorizontal: 15,
    backgroundColor: "#f8f8f8",
    // borderTopWidth: 1,
    // borderColor: "#ccc",
  },
  iconContainer: {
    padding: 5,
  },
  icon: {
    height: 24,
    width: 24,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  botMessage: {
    alignSelf: "flex-start",
  },
  userMessage: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  userMessageBox: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "pink",
  },
  botMessageBox: {
    maxWidth: isLaptopScreen ? "75%" : "80%",
    minWidth: isLaptopScreen ? 400 : "auto",
    padding: isLaptopScreen ? 14 : 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  botIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginRight: 8,
  },
  voiceIcon: {
    height: 25,
    width: 25,
  },
  chatIcon: {
    height: 20,
    width: 20,
  },
  input: {
    flex: 1,
    height: 40,
    width: "60%",
    fontSize: 16,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    ...Platform.select({
      web: { outlineStyle: "none" },
    }),
  },
  sendIcon: {
    height: 30,
    width: 30,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "flex-end",
    marginBottom: 10,
    gap: 10,
  },
  languageLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    height: 40,
    width: 150,
  },
  closeIcon: {
    alignSelf: "center",
  },
  typingDots: {
    fontSize: 18,
    letterSpacing: 2,
    color: "#555",
  },
});

export default ChatBot;
