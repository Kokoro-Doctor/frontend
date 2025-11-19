# How to Implement Markdown Rendering in React Native

This guide explains how to implement markdown rendering in a React Native application, specifically for displaying formatted text in chatbot messages.

## Overview

Markdown rendering allows you to display rich text formatting (bold, italic, lists, links, etc.) in your React Native app. We use the `react-native-markdown-display` library to achieve this.

## Step 1: Install the Required Package

First, you need to install the markdown display library:

```bash
npm install react-native-markdown-display
```

Or if you're using yarn:

```bash
yarn add react-native-markdown-display
```

This package is already included in your `package.json` as version `^7.0.2`.

## Step 2: Create a FormattedMessageText Component

Create a new component file: `FormattedMessageText.jsx`

### Component Structure

```jsx
import Markdown from "react-native-markdown-display";
import { StyleSheet } from "react-native";

// Component implementation here
```

### Step 2.1: Create Style Factory Function

Create a function that generates markdown styles based on a color parameter. This allows you to have different styles for different contexts (e.g., user messages vs bot messages):

```jsx
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
```

**Key Points:**

- `body` and `text`: Set the base text color and size
- `paragraph`: Controls spacing between paragraphs
- `strong`: Styles for bold text (`**text**` or `__text__`)
- `em`: Styles for italic text (`*text*` or `_text_`)
- `bullet_list` and `ordered_list`: Styles for lists
- `link`: Styles for clickable links

### Step 2.2: Create Style Instances

Create specific style instances for different use cases:

```jsx
const botMarkdownStyles = createMarkdownStyles("#333");
const userMarkdownStyles = createMarkdownStyles("#000");
```

This creates two style sets:

- **Bot messages**: Dark gray text (#333)
- **User messages**: Black text (#000)

### Step 2.3: Create the Component

```jsx
const FormattedMessageText = ({ sender, text }) => {
  const markdownStyle =
    sender === "user" ? userMarkdownStyles : botMarkdownStyles;

  return <Markdown style={markdownStyle}>{text || ""}</Markdown>;
};

export default FormattedMessageText;
```

**How it works:**

- Takes `sender` and `text` as props
- Selects the appropriate style based on the sender
- Renders the text using the `Markdown` component
- Falls back to empty string if text is not provided

## Step 3: Use the Component in Your Chat

### Import the Component

In your chatbot component file (e.g., `ChatBot.jsx` or `MobileChatbot.jsx`):

```jsx
import FormattedMessageText from "./FormattedMessageText";
```

### Replace Plain Text with Formatted Component

**Before (plain text):**

```jsx
<Text style={styles.messageText}>{item.text}</Text>
```

**After (with markdown):**

```jsx
<FormattedMessageText sender={item.sender} text={item.text} />
```

### Complete Example in Chat Message

```jsx
const renderItem = ({ item, index }) => {
  return (
    <View style={styles.messageContainer}>
      <View style={styles.messageBox}>
        <FormattedMessageText sender={item.sender} text={item.text} />
        {/* Other message elements */}
      </View>
    </View>
  );
};
```

## Step 4: Supported Markdown Syntax

Once implemented, your messages will support the following markdown syntax:

### Text Formatting

- **Bold**: `**bold text**` or `__bold text__`
- _Italic_: `*italic text*` or `_italic text_`
- **_Bold Italic_**: `***bold italic***`

### Lists

- **Bullet List**:

  ```
  - Item 1
  - Item 2
  - Item 3
  ```

- **Ordered List**:
  ```
  1. First item
  2. Second item
  3. Third item
  ```

### Links

- **Links**: `[Link Text](https://example.com)`

### Paragraphs

- Separate paragraphs with blank lines

## Step 5: Customizing Styles

### Adding More Style Properties

You can extend the `createMarkdownStyles` function to include more properties:

```jsx
const createMarkdownStyles = (color) =>
  StyleSheet.create({
    // ... existing styles ...

    // Add heading styles
    heading1: {
      fontSize: 24,
      fontWeight: "bold",
      color,
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      fontSize: 20,
      fontWeight: "bold",
      color,
      marginTop: 12,
      marginBottom: 6,
    },

    // Add code block styles
    code_inline: {
      backgroundColor: "#f4f4f4",
      padding: 2,
      borderRadius: 3,
      fontFamily: "monospace",
    },

    // Add blockquote styles
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: "#ccc",
      paddingLeft: 12,
      marginLeft: 0,
      fontStyle: "italic",
    },
  });
```

### Available Style Keys

The `react-native-markdown-display` library supports many style keys:

- `body`, `text`, `paragraph`
- `heading1` through `heading6`
- `strong`, `em`, `s` (strikethrough)
- `link`, `blocklink`
- `bullet_list`, `ordered_list`, `list_item`
- `code_inline`, `code_block`, `fence`
- `blockquote`, `table`, `thead`, `tbody`, `th`, `tr`, `td`
- `image`, `hr` (horizontal rule)

## Step 6: Testing

Test your implementation with various markdown inputs:

```jsx
// Test message with markdown
const testMessage = {
  sender: "bot",
  text: "Here's some **bold text** and *italic text*. Check out [this link](https://example.com).\n\n- List item 1\n- List item 2",
};
```

## Troubleshooting

### Issue: Styles not applying

- **Solution**: Make sure you're passing the `style` prop correctly to the `Markdown` component
- Check that StyleSheet.create is being used correctly

### Issue: Text not rendering

- **Solution**: Ensure the `text` prop is not null or undefined (we use `text || ""` as a fallback)

### Issue: Colors not matching design

- **Solution**: Adjust the color values in `createMarkdownStyles` calls
- You can use hex colors, RGB, or named colors

### Issue: Links not clickable

- **Solution**: The library handles link clicks automatically, but you may need to configure link handling for your specific use case

## Best Practices

1. **Reusable Component**: Keep the `FormattedMessageText` component separate and reusable
2. **Style Consistency**: Use the factory function pattern to maintain consistent styling
3. **Performance**: The markdown rendering is optimized, but avoid rendering very long markdown strings
4. **Accessibility**: Ensure text colors have sufficient contrast for readability
5. **Error Handling**: Always provide fallback values (like `text || ""`)

## File Structure

```
components/
  PatientScreenComponents/
    ChatbotComponents/
      FormattedMessageText.jsx    # Markdown component
      ChatBot.jsx                 # Uses FormattedMessageText
      MobileChatbot.jsx           # Uses FormattedMessageText
```

## Summary

To implement markdown rendering:

1. ✅ Install `react-native-markdown-display`
2. ✅ Create a `FormattedMessageText` component
3. ✅ Create style factory function for customizable styles
4. ✅ Use the component in place of plain `<Text>` components
5. ✅ Customize styles as needed for your design

This implementation allows your chatbot (or any text display) to render rich, formatted text with minimal code changes!
