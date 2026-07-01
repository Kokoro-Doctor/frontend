import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../env-vars";

const STAFF_API = `${API_URL}/hospitals/staff`;

const getToken = async () =>
  Platform.OS === "web"
    ? localStorage.getItem("token")
    : await AsyncStorage.getItem("token");

const parseErrorMessage = async (response, fallback) => {
  const text = await response.text();
  try {
    const err = JSON.parse(text);
    return err.detail || err.message || fallback;
  } catch (_) {
    return `${fallback} (${response.status})`;
  }
};

/**
 * List documents for a patient visible to the calling hospital
 * (the patient's own uploads + documents this hospital uploaded for them).
 * @param {string} userId
 * @returns {Promise<{user_id: string, count: number, documents: Array}>}
 */
export const listPatientDocuments = async (userId) => {
  const token = await getToken();
  const response = await fetch(
    `${STAFF_API}/patients/${encodeURIComponent(userId)}/documents`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load documents"));
  }

  return response.json();
};

/**
 * Attach one or more documents to an existing patient.
 * @param {string} userId
 * @param {Array<{file: (File|{uri: string, mimeType?: string, type?: string}), filename: string, docType?: string}>} files
 * @returns {Promise<{user_id: string, documents: Array}>}
 */
export const uploadPatientDocuments = async (userId, files) => {
  const token = await getToken();
  const formData = new FormData();
  const metadataMap = {};

  files.forEach(({ file, filename, docType }) => {
    if (Platform.OS === "web") {
      formData.append("files", file, filename);
    } else {
      formData.append("files", {
        uri: file.uri,
        name: filename,
        type: file.mimeType || file.type || "application/octet-stream",
      });
    }
    if (docType) {
      metadataMap[filename] = { doc_type: docType };
    }
  });

  if (Object.keys(metadataMap).length > 0) {
    formData.append("metadata", JSON.stringify(metadataMap));
  }

  const response = await fetch(
    `${STAFF_API}/patients/${encodeURIComponent(userId)}/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to upload documents"));
  }

  return response.json();
};
