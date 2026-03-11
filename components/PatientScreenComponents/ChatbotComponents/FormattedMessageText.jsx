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
    heading1: {
      fontWeight: "700",
      fontSize: 22,
      color,
      marginTop: 12,
      marginBottom: 6,
    },
    heading2: {
      fontWeight: "700",
      fontSize: 19,
      color,
      marginTop: 10,
      marginBottom: 4,
    },
    heading3: {
      fontWeight: "700",
      fontSize: 16,
      color,
      marginTop: 8,
      marginBottom: 4,
    },
    heading4: {
      fontWeight: "700",
      fontSize: 15,
      color,
      marginTop: 6,
      marginBottom: 2,
    },
    heading5: {
      fontWeight: "700",
      fontSize: 14,
      color,
      marginTop: 4,
      marginBottom: 2,
    },
    heading6: {
      fontWeight: "700",
      fontSize: 13,
      color,
      marginTop: 4,
      marginBottom: 2,
    },
    hr: {
      height: 0,
      marginVertical: 4,
      borderWidth: 0,
      opacity: 0,
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

const FormattedMessageText = ({ sender, text, textColor }) => {
  const markdownStyle =
    textColor != null
      ? createMarkdownStyles(textColor)
      : sender === "user"
        ? userMarkdownStyles
        : botMarkdownStyles;

  return <Markdown style={markdownStyle}>{text || ""}</Markdown>;
};

export default FormattedMessageText;
