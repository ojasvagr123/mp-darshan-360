const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export function getToken() {
  return localStorage.getItem("mpdarshan_token");
}

export function setSession(session) {
  localStorage.setItem("mpdarshan_token", session.token);
  localStorage.setItem("mpdarshan_user", JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem("mpdarshan_token");
  localStorage.removeItem("mpdarshan_user");
}

export function getSavedUser() {
  const raw = localStorage.getItem("mpdarshan_user");
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data;
}

export const api = {
  addComment: (placeId, body) =>
    request(`/places/${placeId}/comments`, {
      body: JSON.stringify({ body }),
      method: "POST",
    }),
  createPlace: (formData) =>
    request("/places", {
      body: formData,
      method: "POST",
    }),
  getPlaces: (params = {}) => {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value),
    );
    return request(`/places?${search.toString()}`);
  },
  getGuide: (placeId) => request(`/places/${placeId}/guide`),
  login: (payload) =>
    request("/auth/login", {
      body: JSON.stringify(payload),
      method: "POST",
    }),
  register: (payload) =>
    request("/auth/register", {
      body: JSON.stringify(payload),
      method: "POST",
    }),
};
