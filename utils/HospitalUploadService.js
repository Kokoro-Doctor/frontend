import { API_URL } from "../env-vars";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const HOSPITAL_API = `${API_URL}/hospital`;

/**
 * Direct upload: send file through backend (no S3 CORS needed).
 * Uses POST /hospital/upload with multipart/form-data.
 * @returns {Promise<{file_id: string, message: string}>}
 */
export const uploadFileDirect = async (apiKey, hospitalId, patientId, file) => {
  const formData = new FormData();
  formData.append("hospital_id", hospitalId);
  formData.append("patient_id", patientId);

  if (Platform.OS === "web") {
    formData.append("file", file);
  } else {
    formData.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
      name: file.name,
    });
  }

  const response = await fetch(`${HOSPITAL_API}/upload`, {
    method: "POST",
    headers: {
      "x-hospital-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message =
      errData.detail || errData.message || response.statusText || "Upload failed";
    throw new Error(message);
  }

  return response.json();
};

/**
 * Step 1: Request presigned upload URLs for multiple files (batch)
 * @param {string} apiKey - Hospital API key
 * @param {string} hospitalId
 * @param {string} patientId
 * @param {Array<{filename: string}>} files - [{ filename: "report.pdf" }, ...]
 * @returns {Promise<{uploads: Array<{file_id: string, filename: string, upload_url: string}>}>}
 */
export const requestPresignedUrlsBatch = async (
  apiKey,
  hospitalId,
  patientId,
  files
) => {
  const response = await fetch(`${HOSPITAL_API}/presign-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hospital-api-key": apiKey,
    },
    body: JSON.stringify({
      hospital_id: hospitalId,
      patient_id: patientId,
      files: files.map((f) => ({ filename: f.filename })),
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message =
      errData.detail || errData.message || response.statusText || "Failed to get upload URLs";
    throw new Error(message);
  }

  return response.json();
};

/**
 * Step 2: Upload file directly to S3 using presigned URL
 * @param {string} uploadUrl - Presigned PUT URL from Step 1
 * @param {Object} file - { uri, name, mimeType } (native) or File (web)
 * @param {string} contentType - MIME type for the file
 */
export const uploadToS3 = async (uploadUrl, file, contentType) => {
  const contentTypeHeader = contentType || "application/octet-stream";

  if (Platform.OS === "web") {
    // Web: file is a File object, use directly as body
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentTypeHeader,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
    }
    return;
  }

  // Native: use FileSystem.uploadAsync
  const result = await FileSystem.uploadAsync(uploadUrl, file.uri, {
    httpMethod: "PUT",
    headers: {
      "Content-Type": contentTypeHeader,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`S3 upload failed: ${result.status}`);
  }
};

/**
 * Step 3: Confirm batch upload completed - save metadata to DynamoDB for each file
 * @param {string} apiKey - Hospital API key
 * @param {string} hospitalId
 * @param {string} patientId
 * @param {Array<{file_id: string, filename: string, file_size?: number}>} files
 * @returns {Promise<{confirmed: Array<{file_id: string, message: string}>, errors: Array}>}
 */
export const confirmUploadBatch = async (
  apiKey,
  hospitalId,
  patientId,
  files
) => {
  const response = await fetch(`${HOSPITAL_API}/confirm-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hospital-api-key": apiKey,
    },
    body: JSON.stringify({
      hospital_id: hospitalId,
      patient_id: patientId,
      files: files.map((f) => ({
        file_id: f.file_id,
        filename: f.filename,
        file_size: f.file_size,
      })),
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message =
      errData.detail || errData.message || response.statusText || "Failed to confirm upload";
    throw new Error(message);
  }

  return response.json();
};
