import { API_URL } from "../env-vars";
import { Platform } from "react-native";

/**
 * Import patients from Excel file.
 * POST /booking/doctors/{doctor_id}/import-patients
 * @param {string} doctorId - Doctor ID
 * @param {object} file - File object (web: File, native: { uri, name, mimeType })
 * @returns {Promise<{total_rows, users_created, existing_users, subscriptions_created, skipped}>}
 */
export const importPatientsFromExcel = async (doctorId, file) => {
  const formData = new FormData();
  if (Platform.OS === "web") {
    formData.append("file", file);
  } else {
    formData.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      name: file.name,
    });
  }

  const response = await fetch(`${API_URL}/booking/doctors/${doctorId}/import-patients`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.detail || errData.message || response.statusText || "Import failed";
    throw new Error(message);
  }

  return response.json();
};
