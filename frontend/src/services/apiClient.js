const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const authenticatedFetch = async (path, options = {}) => {
  const { skipUnauthorizedEvent = false, ...fetchOptions } = options;
  const token = localStorage.getItem("pg_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
      ...fetchOptions.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (response.status === 401 && !skipUnauthorizedEvent) {
    window.dispatchEvent(new CustomEvent("pg-auth-unauthorized"));
    throw new Error("Your session has expired. Please sign in again.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || "Request failed.");
  return payload;
};
