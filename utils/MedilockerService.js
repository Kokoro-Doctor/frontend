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

export const download = async (email, fileName) => {
    try {
        const encodedUserId = encodeURIComponent(email);
        const encodedFileName = encodeURIComponent(fileName);
        const response = await fetch(`${medilocker_API}/users/${encodedUserId}/files/${encodedFileName}/download`, {
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

export const remove = async (email, fileName) => {
    try {
        const encodedUserId = encodeURIComponent(email);
        const encodedFileName = encodeURIComponent(fileName);
        const response = await fetch(`${medilocker_API}/users/${encodedUserId}/files/${encodedFileName}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
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

export const extractStructuredData = async (files) => {
    const apiUrl = `${medilocker_API}/prescription`;

    try {
        // Create FormData for multipart/form-data upload
        const formData = new FormData();

        // Helper function to get MIME type from filename
        const getMimeType = (filename) => {
            const ext = filename.split('.').pop().toLowerCase();
            const mimeTypes = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'txt': 'text/plain',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            };
            return mimeTypes[ext] || 'application/octet-stream';
        };

        // Check if files are File objects or base64 objects
        if (files && files.length > 0) {
            // Check if first item is a File object (has .name and .type properties)
            if (files[0] instanceof File || (files[0].name && files[0].type && !files[0].content)) {
                // Files are already File objects - append directly
                files.forEach((file, index) => {
                    formData.append('files', file, file.name);
                });
            } else {
                // Files are base64 objects - convert to Blob and append
                files.forEach((fileObj, index) => {
                    const { filename, content } = fileObj;
                    if (!filename || !content) {
                        throw new Error(`File at index ${index} is missing filename or content`);
                    }

                    // Convert base64 to binary
                    const binaryString = atob(content);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    // Create Blob with appropriate MIME type
                    const mimeType = getMimeType(filename);
                    const blob = new Blob([bytes], { type: mimeType });

                    // Create File object from Blob
                    const file = new File([blob], filename, { type: mimeType });
                    formData.append('files', file, filename);
                });
            }
        } else {
            throw new Error('No files provided');
        }

        // Send as multipart/form-data (don't set Content-Type header - browser will set it with boundary)
        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = `Extraction failed with status ${response.status}`;
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
        throw new Error(`Error: ${err.message}`);
    }
};