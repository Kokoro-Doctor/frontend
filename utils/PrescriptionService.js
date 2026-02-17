import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

/**
 * Convert prescription markdown to HTML for PDF export
 * @param {string} text - The prescription text (markdown)
 * @returns {string} - HTML string
 */
const markdownToHtml = (text) => {
  if (!text) return "";
  return md.render(text);
};


/**
 * Generate HTML content for prescription PDF
 * @param {Object} prescription - The prescription object
 * @param {Object} doctorInfo - Doctor information object with name and specialty
 * @returns {string} - HTML string for the prescription
 */
export const generatePrescriptionHTML = (prescription, doctorInfo) => {
  const doctorName = doctorInfo?.name || doctorInfo?.doctorname || "";
  const doctorSpecialty = doctorInfo?.specialization || "";
  const rxHtml = markdownToHtml(
    prescription.prescriptionReport || ""
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Prescription - ${prescription.patientName || "Patient"}</title>
  <style>
    @media print {
      @page {
        margin: 20mm;
        size: A4;
      }
    }
    body {
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #FF7072;
      padding-bottom: 15px;
    }
    .logo {
      width: 50px;
      height: 50px;
      margin-right: 15px;
    }
    .clinic-name {
      font-size: 24px;
      font-weight: bold;
      color: #FF7072;
    }
    .date-doctor-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding: 15px 0;
      border-bottom: 1px solid #E0E0E0;
    }
    .date-text, .doctor-text {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doctor-info {
      text-align: right;
    }
    .patient-details {
      margin: 20px 0;
      padding: 15px;
      background-color: #F8F9FA;
      border-radius: 8px;
    }
    .detail-row {
      display: flex;
      margin-bottom: 15px;
    }
    .detail-item {
      flex: 1;
      margin-right: 20px;
    }
    .detail-label {
      font-size: 11px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .detail-value {
      font-size: 14px;
      color: #333;
    }
    .rx-section {
      margin-top: 30px;
      padding: 20px;
      background-color: #FFFFFF;
      border: 1px solid #F0F0F0;
      border-radius: 8px;
    }
    .rx-title {
      font-size: 18px;
      font-weight: bold;
      color: #FF7072;
      margin-bottom: 15px;
    }
    .rx-text {
      font-size: 14px;
      color: #555;
      line-height: 1.8;
    }
    .rx-text strong {
      font-weight: 600;
    }
    .rx-text ul, .rx-text ol {
      margin: 0.5em 0;
      padding-left: 1.5em;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic-name">Kokoro.Doctor</div>
  </div>

  <div class="date-doctor-row">
    <div>
      <div class="date-text">Date: ${prescription.date || ""}</div>
    </div>
    <div class="doctor-info">
      <div class="doctor-text">DR: ${doctorName}</div>
      <div style="color: #888; font-size: 12px; margin-top: 4px;">${doctorSpecialty}</div>
    </div>
  </div>

  <div class="patient-details">
    <div class="detail-row">
      <div class="detail-item">
        <div class="detail-label">Patient Name</div>
        <div class="detail-value">${prescription.patientName || ""}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Age</div>
        <div class="detail-value">${prescription.age || ""}</div>
      </div>
    </div>
    <div class="detail-row">
      <div class="detail-item">
        <div class="detail-label">Gender</div>
        <div class="detail-value">${prescription.gender || ""}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Diagnosis</div>
        <div class="detail-value">${prescription.diagnosis || ""}</div>
      </div>
    </div>
  </div>

  <div class="rx-section">
    <div class="rx-title">RX</div>
    <div class="rx-text">${rxHtml || "No prescription report generated"}</div>
  </div>
</body>
</html>
  `;
};

/**
 * Download prescription as PDF/HTML
 * @param {Object} prescription - The prescription object to download
 * @param {Object} doctorInfo - Doctor information object
 * @returns {Promise<void>}
 */
export const downloadPrescription = async (prescription, doctorInfo) => {
  try {
    if (!prescription) {
      throw new Error("Prescription data is required");
    }

    const htmlContent = generatePrescriptionHTML(prescription, doctorInfo);
    const fileName = `Prescription_${prescription.patientName || "Patient"}_${new Date().toISOString().split("T")[0]}.html`;

    if (Platform.OS === "web") {
      // For web: Open print dialog which allows saving as PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // After print dialog closes, close the window
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          }, 500);
        };
      } else {
        // Fallback: Download as HTML if popup blocked
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert(
          "Download Started",
          "Please use your browser's print dialog to save as PDF."
        );
      }
    } else {
      // For mobile: Save HTML file and share
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, htmlContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/html",
          dialogTitle: "Share Prescription",
        });
      } else {
        Alert.alert(
          "Sharing not available",
          "File saved to: " + fileUri
        );
      }
    }
  } catch (error) {
    console.error("Error downloading prescription:", error);
    Alert.alert(
      "Download Error",
      "Failed to download prescription. Please try again."
    );
    throw error;
  }
};
