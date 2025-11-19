import Markdown from "react-native-markdown-display";
import { StyleSheet } from "react-native";

const createMarkdownStyles = (color) =>
  StyleSheet.create({
    body: {
      color,
      fontSize: 16,
      lineHeight: 22,
    },
    text: {
      color,
      fontSize: 16,
      lineHeight: 22,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    strong: {
      fontWeight: "700",
      color,
    },
    em: {
      fontStyle: "italic",
      color,
    },
    bullet_list: {
      marginBottom: 8,
    },
    bullet_list_icon: {
      color,
    },
    ordered_list: {
      marginBottom: 8,
    },
    ordered_list_text: {
      color,
    },
    link: {
      color: "#577CEF",
    },
  });

const botMarkdownStyles = createMarkdownStyles("#333");
const userMarkdownStyles = createMarkdownStyles("#000");

const FormattedMessageText = ({ sender, text }) => {
  const markdownStyle = sender === "user" ? userMarkdownStyles : botMarkdownStyles;

  return <Markdown style={markdownStyle}>{text || ""}</Markdown>;
};

export default FormattedMessageText;

