import { Alert } from "react-native";
import { API_URL } from "../env-vars";

const medilocker_API = `${API_URL}/medilocker`;

export const FetchFromServer = async (email) => {
    try {
        const encodedUserId = encodeURIComponent(email);
        const response = await fetch(`${medilocker_API}/users/${encodedUserId}/files`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
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

export const download = async (email, fileId) => {
    try {
        const encodedUserId = encodeURIComponent(email);
        const encodedFileId = encodeURIComponent(fileId);
        const response = await fetch(`${medilocker_API}/users/${encodedUserId}/files/${encodedFileId}/download`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
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

export const remove = async (email, fileId) => {
    try {
        if (!fileId) {
            throw new Error("File ID is required for delete");
        }
        const encodedUserId = encodeURIComponent(email);
        const encodedFileId = encodeURIComponent(fileId);
        const response = await fetch(`${medilocker_API}/users/${encodedUserId}/files/${encodedFileId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            let message = "Delete request failed";
            try {
                const errData = await response.json();
                message = errData.detail || errData.message || message;
            } catch (_) {
                message = `${message} (${response.status})`;
            }
            throw new Error(message);
        }

        const data = await response.json();
        return data;

    } catch (err) {
        alert(`Error: ${err.message}`);
        Alert.alert(`Error: ${err.message}`);
        throw err;
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

export const extractStructuredData = async (files) => {
    const apiUrl = `${medilocker_API}/prescription`;

    const requestBody = {
        files: files,
    };

    const requestBodyString = JSON.stringify(requestBody);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBodyString,
        });

        if (!response.ok) {
            throw new Error(`Extraction failed with status ${response.status}`);
        }

        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
            return data;
        }
        catch (parseError) {
            throw new Error(`Failed to parse response: ${parseError.message}`);
        }

    } catch (err) {
        throw new Error(`Error: ${err.message}`);
    }
};