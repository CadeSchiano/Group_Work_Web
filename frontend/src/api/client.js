const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const buildHeaders = (token, hasBody = false, isFormData = false) => {
  const headers = {};

  if (hasBody && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const apiRequest = async (path, { method = "GET", token, body, isFormData = false } = {}) => {
  const hasBody = body !== undefined;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(token, hasBody, isFormData),
    body: hasBody ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `${response.status} ${response.statusText}` || "Request failed.");
  }

  return data;
};
