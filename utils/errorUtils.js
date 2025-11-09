export class APIError extends Error {
  constructor({ message, status, data }) {
    super(message || "Request failed");
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

const joinMessages = (messages) => {
  if (!messages || !messages.length) {
    return "";
  }
  return messages
    .map((msg) => (typeof msg === "string" ? msg : JSON.stringify(msg)))
    .join("\n");
};

const flattenObjectMessages = (obj) => {
  if (!obj || typeof obj !== "object") {
    return "";
  }

  const collected = [];
  Object.values(obj).forEach((value) => {
    if (Array.isArray(value)) {
      collected.push(...value.map((item) => extractErrorMessageFromData(item)));
    } else {
      collected.push(extractErrorMessageFromData(value));
    }
  });

  return joinMessages(collected.filter(Boolean));
};

export const extractErrorMessageFromData = (data) => {
  if (!data) return "";

  if (typeof data === "string") return data;

  if (Array.isArray(data)) {
    const msgs = data
      .map((item) =>
        typeof item === "object"
          ? item.msg || item.message || extractErrorMessageFromData(item.detail)
          : item
      )
      .filter(Boolean);
    return joinMessages(msgs);
  }

  if (typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;

    if (Array.isArray(data.detail)) {
      const detailMessages = data.detail
        .map((detail) => {
          if (typeof detail === "string") return detail;
          if (typeof detail === "object") {
            return (
              detail.msg ||
              detail.message ||
              extractErrorMessageFromData(detail.detail)
            );
          }
          return "";
        })
        .filter(Boolean);
      const joinedDetail = joinMessages(detailMessages);
      if (joinedDetail) return joinedDetail;
    }

    if (typeof data.detail === "object") {
      const nested = extractErrorMessageFromData(data.detail);
      if (nested) return nested;
    }

    if (data.message) return extractErrorMessageFromData(data.message);

    if (data.error) return extractErrorMessageFromData(data.error);

    if (data.errors) return flattenObjectMessages(data.errors);
  }

  return "";
};

export const createApiError = ({ response, data, fallbackMessage }) => {
  const status = response?.status;
  const message =
    extractErrorMessageFromData(data) ||
    fallbackMessage ||
    `Request failed with status ${status ?? "unknown"}`;
  return new APIError({ message, status, data });
};

export const getErrorMessage = (error) => {
  if (!error) return "Something went wrong. Please try again.";

  if (error instanceof APIError) return error.message;

  if (error.response && error.response.data) {
    const message = extractErrorMessageFromData(error.response.data);
    if (message) return message;
  }

  if (error.data) {
    const message = extractErrorMessageFromData(error.data);
    if (message) return message;
  }

  if (error.message) return error.message;

  return "Something went wrong. Please try again.";
};

export const ensureError = (error) => {
  if (error instanceof Error) return error;
  return new Error(getErrorMessage(error));
};

