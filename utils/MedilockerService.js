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

export const extractStructuredData = async (files, frontendPatientDetails = null) => {
    const apiUrl = `${medilocker_API}/extract-structured-data`;
    
    console.log("🔵 [extractStructuredData] Starting extraction...");
    console.log("🔵 [extractStructuredData] Base API URL:", medilocker_API);
    console.log("🔵 [extractStructuredData] Full API URL:", apiUrl);
    console.log("🔵 [extractStructuredData] Request method: POST");
    console.log("🔵 [extractStructuredData] Number of files:", files?.length || 0);
    
    // Log file info (without base64 content)
    if (files && files.length > 0) {
        files.forEach((file, index) => {
            console.log(`🔵 [extractStructuredData] File ${index + 1}:`, {
                filename: file.filename,
                contentLength: file.content?.length || 0,
                contentPreview: file.content?.substring(0, 50) + "..." || "No content"
            });
        });
    }
    
    const requestBody = {
        files: files,
        frontend_patient_details: frontendPatientDetails,
    };
    
    const requestBodyString = JSON.stringify(requestBody);
    console.log("🔵 [extractStructuredData] Request body size:", requestBodyString.length, "bytes");
    
    try {
        console.log("🔵 [extractStructuredData] Sending fetch request...");
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBodyString,
        });

        console.log("🔵 [extractStructuredData] Response received:", {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            let errorMessage = `Extraction failed with status ${response.status}`;
            let errorDetails = null;
            
            try {
                const errorData = await response.json();
                console.error("🔴 [extractStructuredData] Error response data:", errorData);
                errorMessage = errorData.detail || errorData.message || errorMessage;
                errorDetails = errorData;
            } catch (e) {
                console.error("🔴 [extractStructuredData] Failed to parse error response:", e);
                const errorText = await response.text().catch(() => "Could not read error response");
                console.error("🔴 [extractStructuredData] Error response text:", errorText);
                errorMessage = response.statusText || errorMessage;
            }
            
            const fullError = new Error(errorMessage);
            fullError.status = response.status;
            fullError.details = errorDetails;
            throw fullError;
        }

        console.log("🔵 [extractStructuredData] Parsing response JSON...");
        const data = await response.json();
        console.log("✅ [extractStructuredData] Extraction successful:", {
            hasPatientDetails: !!data.patient_details,
            hasPrescriptionReport: !!data.prescription_report,
            prescriptionReportLength: data.prescription_report?.length || 0
        });
        
        return data;

    } catch (err) {
        console.error("🔴 [extractStructuredData] Error caught:", {
            name: err.name,
            message: err.message,
            stack: err.stack,
            status: err.status,
            details: err.details
        });
        
        // Handle different error types
        let userFriendlyMessage = "Failed to extract prescription data";
        
        if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
            userFriendlyMessage = `Network error: Unable to connect to the server. Please check:\n- Your internet connection\n- API URL: ${apiUrl}\n- CORS settings\n\nOriginal error: ${err.message}`;
            console.error("🔴 [extractStructuredData] Network/CORS error detected");
        } else if (err.status) {
            userFriendlyMessage = `Server error (${err.status}): ${err.message}`;
        } else {
            userFriendlyMessage = `Error: ${err.message}`;
        }
        
        console.error("🔴 [extractStructuredData] User-friendly error message:", userFriendlyMessage);
        
        // Don't show alert here - let the caller handle it
        // alert(`Error: ${userFriendlyMessage}`);
        // Alert.alert(`Error: ${userFriendlyMessage}`);
        
        throw {
            ...err,
            userFriendlyMessage: userFriendlyMessage,
            originalMessage: err.message
        };
    }
};