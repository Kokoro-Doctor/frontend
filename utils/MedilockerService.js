import { Alert } from "react-native";
import {API_URL} from "../env-vars";

const medilocker_API = `${API_URL}/medilocker`;

export const FetchFromServer = async(email) => {
    try {
        const response = await fetch(`${medilocker_API}/fetch`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: email,
            }),
        });
    
        if (!response.ok) {
            throw new Error("Failed to load files from server");
        }

        const data = await response.json();
        return data;

    } catch (err) {
        alert(`Error: ${err.message}`);
        Alert.alert(`Error: ${err.message}`);
    }
}

export const upload = async (payload) => {
    try {
        const response = await fetch(`${medilocker_API}/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    
        if (!response.ok) {
            let errorMessage = "File upload failed";
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
                // If response is not JSON, use status text
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
    
        const data = await response.json();
        return data;

    } catch (err) {
        alert(`Error: ${err.message}`);
        Alert.alert(`Error: ${err.message}`);
        throw err; // Re-throw so caller can handle if needed
    }
};

export const download = async (email, fileName) => {
    try {
        const response = await fetch(`${medilocker_API}/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: email,
                filename: fileName,
            }),
        });

        if (!response.ok) {
            throw new Error("Download request failed");
        }

        const data = await response.json();
        return data;

    } catch (err) {
        alert(`Error: ${err.message}`);
        Alert.alert(`Error: ${err.message}`);
    }
};

export const remove = async (email, fileName) => {
    try {
        const response = await fetch(`${medilocker_API}/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: email,
                filename: fileName,
            }),
        });
    
        if (!response.ok) {
            throw new Error("Delete request failed");
        }

        const data = await response.json();
        return data;

    } catch (err) {
        alert(`Error: ${err.message}`);
        Alert.alert(`Error: ${err.message}`);
    }
};

export const shortenUrl = async (longUrl) => {
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to shorten URL');
    }
    const shortenedUrl = await response.text();
    return shortenedUrl;
};