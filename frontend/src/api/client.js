const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

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

export const apiRequest = async (
  path,
  { method = "GET", token, body, isFormData = false, responseType = "json" } = {},
) => {
  const hasBody = body !== undefined;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: buildHeaders(token, hasBody, isFormData),
    body: hasBody ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (responseType === "blob") {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `${response.status} ${response.statusText}` || "Request failed.");
    }

    return response.blob();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `${response.status} ${response.statusText}` || "Request failed.");
  }

  return data;
};

export const getApiOrigin = () => API_ORIGIN;
