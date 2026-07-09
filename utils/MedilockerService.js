import { Alert, Platform } from "react-native";
import { API_URL } from "../env-vars";

const medilocker_API = `${API_URL}/medilocker`;

// Debug: log API base on first Medilocker call (helps verify live vs local)
if (typeof window !== "undefined") {
  console.log("[Medilocker] API base", { API_URL, medilocker_API });
}

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

/**
 * Upload files to a user's Medilocker via multipart/form-data.
 * Uses the async endpoint — the server stores the file and returns 202
 * immediately, OCR/extraction runs in the background. Poll
 * GET /medilocker/users/{user_id}/files/{file_id}/status for completion.
 * @param {Object} payload
 * @param {string} payload.user_id
 * @param {Array<{filename: string, uri: string, file?: File, mimeType?: string, metadata?: Object}>} payload.files
 *   `file` (web only) is the picked File/Blob object; `uri` is used on native (and as a web fallback).
 * @returns {Promise<{message: string, files: Array<{file_id: string, filename: string, status: string}>}>}
 */
export const upload = async (payload) => {
    try {
        const { user_id, files = [] } = payload;
        const formData = new FormData();
        formData.append("user_id", user_id);

        const metadataMap = {};
        for (const file of files) {
            if (Platform.OS === "web") {
                const webFile = file.file || (await fetch(file.uri).then((r) => r.blob()));
                formData.append("files", webFile, file.filename);
            } else {
                formData.append("files", {
                    uri: file.uri,
                    name: file.filename,
                    type: file.mimeType || "application/octet-stream",
                });
            }
            if (file.metadata) {
                metadataMap[file.filename] = file.metadata;
            }
        }
        if (Object.keys(metadataMap).length > 0) {
            formData.append("metadata", JSON.stringify(metadataMap));
        }

        const response = await fetch(`${medilocker_API}/upload/async`, {
            method: "POST",
            body: formData,
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

/**
 * Save an approved prescription (PDF) to the patient's Medilocker.
 * @param {string} userId - Patient's user ID (Medilocker owner)
 * @param {string} prescriptionPdfBase64 - Base64-encoded PDF content
 * @param {string} [filename] - Optional display filename
 * @returns {Promise<{file_id: string, filename: string}>}
 */
export const savePrescriptionToMedilocker = async (userId, prescriptionPdfBase64, filename) => {
    try {
        const encodedUserId = encodeURIComponent(userId);
        const url = `${medilocker_API}/users/${encodedUserId}/prescription/save`;
        console.log("[Medilocker] savePrescription request", { url, payloadSize: prescriptionPdfBase64?.length });

        // Backend now expects multipart/form-data (raw bytes), not base64-in-JSON.
        const pdfBlob = await fetch(`data:application/pdf;base64,${prescriptionPdfBase64}`).then((r) => r.blob());
        const formData = new FormData();
        formData.append("file", pdfBlob, filename || "prescription.pdf");
        if (filename) {
            formData.append("filename", filename);
        }

        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        console.log("[Medilocker] savePrescription response", {
            status: response.status,
            ok: response.ok,
            url: response.url,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[Medilocker] savePrescription error", { status: response.status, errorData });
            throw new Error(
                errorData.detail || errorData.message || `Save failed: ${response.status}`
            );
        }

        const data = await response.json();
        console.log("[Medilocker] savePrescription success", data);
        return data;
    } catch (err) {
        console.error("[Medilocker] savePrescription exception", err);
        throw err;
    }
};

// export const extractStructuredData = async (files) => {
//     const apiUrl = `${medilocker_API}/prescription`;

//     const requestBody = {
//         files: files,
//     };

//     const requestBodyString = JSON.stringify(requestBody);

//     try {
//         const response = await fetch(apiUrl, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: requestBodyString,
//         });

//         if (!response.ok) {
//             throw new Error(`Extraction failed with status ${response.status}`);
//         }

//         const responseText = await response.text();

//         let data;
//         try {
//             data = JSON.parse(responseText);
//             return data;
//         }
//         catch (parseError) {
//             throw new Error(`Failed to parse response: ${parseError.message}`);
//         }

//     } catch (err) {
//         throw new Error(`Error: ${err.message}`);
//     }
// };
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

        const responseText = await response.text();

        if (!response.ok) {
            let errorDetail = responseText;
            try {
                const errorJson = JSON.parse(responseText);
                errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
            } catch (_) {
                // responseText wasn't JSON, use as-is
            }
            console.error("[Medilocker] extractStructuredData error", {
                status: response.status,
                errorDetail,
            });
            throw new Error(`Extraction failed with status ${response.status}: ${errorDetail}`);
        }

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