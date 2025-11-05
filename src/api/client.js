import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

async function buildHeaders(includeAuth = false) {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = await AsyncStorage.getItem("auth_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiPost(path, body, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = await buildHeaders(opts.auth === true);
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body || {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = json;
    throw error;
  }
  return json;
}

export const authApi = {
  async login({ email, password }) {
    return apiPost("/auth/login", { email, password });
  },
  async register({ email, password, confirmPassword, roleName }) {
    return apiPost("/auth/register", { email, password, confirmPassword, roleName });
  },
  async logout() {
    return apiPost("/auth/logout", {}, { auth: true });
  },
};



