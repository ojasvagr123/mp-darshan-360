const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const TOKEN = "sgsits_admin_token", USER = "sgsits_admin_user";
export const setSession = ({ token, user }) => { localStorage.setItem(TOKEN, token); localStorage.setItem(USER, JSON.stringify(user)); };
export const clearSession = () => { localStorage.removeItem(TOKEN); localStorage.removeItem(USER); };
export const getSavedUser = () => { try { return JSON.parse(localStorage.getItem(USER)); } catch { return null; } };
async function request(path, options = {}) { const headers = new Headers(options.headers); const token = localStorage.getItem(TOKEN); if (token) headers.set("Authorization", `Bearer ${token}`); if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json"); const response = await fetch(`${API_URL}${path}`, { ...options, headers }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message ?? "Request failed"); return data; }
export const api = { getPlaces: () => request("/places"), login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }), createPlace: (body) => request("/places", { method: "POST", body }) };
