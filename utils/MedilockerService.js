import { Alert } from "react-native";
import {API_URL} from "../env-vars";

const medilocker_API = `${API_URL}/medilocker`;

export const FetchFromServer = async(email) => {
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
    const apiUrl = `${medilocker_API}/extract-structured-data`;
    
    console.log("[extractStructuredData] Starting prescription extraction...");
    console.log("[extractStructuredData] API URL:", apiUrl);
    console.log("[extractStructuredData] Number of files:", files?.length || 0);
    
    // Log file info (without base64 content)
    if (files && files.length > 0) {
        files.forEach((file, index) => {
            console.log(`[extractStructuredData] File ${index + 1}:`, {
                filename: file.filename,
                contentLength: file.content?.length || 0
            });
        });
    }
    
    const requestBody = {
        files: files,
    };
    
    const requestBodyString = JSON.stringify(requestBody);
    console.log("[extractStructuredData] Request body size:", requestBodyString.length, "bytes");
    
    try {
        console.log("[extractStructuredData] Sending fetch request...");
        
        // Create an AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.error("[extractStructuredData] Request timeout - aborting after 60 seconds");
            controller.abort();
        }, 60000); // 60 second timeout for mobile networks
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBodyString,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("[extractStructuredData] Response received:", {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            let errorMessage = `Extraction failed with status ${response.status}`;
            let errorDetails = null;
            
            try {
                const errorData = await response.json();
                console.error("[extractStructuredData] Error response data:", errorData);
                errorMessage = errorData.detail || errorData.message || errorMessage;
                errorDetails = errorData;
            } catch (e) {
                console.error("[extractStructuredData] Failed to parse error response:", e);
                try {
                    const errorText = await response.text();
                    console.error("[extractStructuredData] Error response text:", errorText);
                } catch (textError) {
                    console.error("[extractStructuredData] Could not read error response");
                }
                errorMessage = response.statusText || errorMessage;
            }
            
            const fullError = new Error(errorMessage);
            fullError.status = response.status;
            fullError.details = errorDetails;
            throw fullError;
        }

        console.log("[extractStructuredData] Parsing response...");
        const responseText = await response.text();
        console.log("[extractStructuredData] Raw response length:", responseText.length);
        console.log("[extractStructuredData] Raw response preview:", responseText.substring(0, 500));
        
        if (!responseText || responseText.trim() === "") {
            console.error("[extractStructuredData] Empty response received");
            throw new Error("Server returned an empty response");
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("[extractStructuredData] Failed to parse JSON:", parseError);
            console.error("[extractStructuredData] Response text:", responseText);
            throw new Error(`Failed to parse response: ${parseError.message}`);
        }
        
        console.log("[extractStructuredData] Parsed data successfully");
        console.log("[extractStructuredData] Data keys:", Object.keys(data || {}));
        console.log("[extractStructuredData] Extraction result:", {
            hasPrescription: !!data.prescription,
            prescriptionLength: data.prescription?.length || 0,
            hasPatinetDetails: !!data.patient_details,
            patientDetailsKeys: Object.keys(data.patient_details || {}),
        });
        
        return data;

    } catch (err) {
        console.error("[extractStructuredData] Error caught:", {
            name: err.name,
            message: err.message,
            stack: err.stack,
            status: err.status,
            details: err.details
        });
        
        // Handle different error types
        let userFriendlyMessage = "Failed to extract prescription data";
        
        if (err.name === "AbortError") {
            userFriendlyMessage = "Request timeout: The server took too long to respond. Please try again with a smaller file or check your network connection.";
            console.error("[extractStructuredData] Request timeout error");
        } else if (err.name === "TypeError") {
            if (err.message.includes("Failed to fetch")) {
                userFriendlyMessage = `Network error: Unable to connect to the server.\n- Check your internet connection\n- Make sure the API is accessible\n- Try again in a moment`;
                console.error("[extractStructuredData] Network/fetch error detected");
            } else {
                userFriendlyMessage = `Network error: ${err.message}`;
            }
        } else if (err.status === 413) {
            userFriendlyMessage = "File too large: The file size exceeds the server limit. Please try with a smaller file.";
        } else if (err.status === 408) {
            userFriendlyMessage = "Request timeout: The server took too long to respond. Please try again.";
        } else if (err.status >= 500) {
            userFriendlyMessage = `Server error: The server is temporarily unavailable. Please try again later.`;
        } else if (err.status) {
            userFriendlyMessage = `Server error (${err.status}): ${err.message}`;
        } else {
            userFriendlyMessage = `Error: ${err.message}`;
        }
        
        console.error("[extractStructuredData] User-friendly error message:", userFriendlyMessage);
        
        throw {
            ...err,
            userFriendlyMessage: userFriendlyMessage,
            originalMessage: err.message
        };
    }
};