import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// For mobile devices, localhost doesn't work
// Android emulator uses 10.0.2.2 to access host machine
// iOS simulator can use localhost
// Physical devices need the actual IP address of your computer
const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // Check if running on web - web can use localhost
  if (Platform.OS === 'web') {
    return envUrl || "http://localhost:3000/api";
  }
  
  // For Android (emulator or device), always use 10.0.2.2 for emulator
  // Override localhost even if set in environment variable
  if (Platform.OS === 'android') {
    // If env URL contains localhost, replace with 10.0.2.2 for Android emulator
    if (envUrl && envUrl.includes('localhost')) {
      // Replace localhost with 10.0.2.2, keep port and path
      return envUrl.replace('localhost', '10.0.2.2');
    }
    // If env URL is set and doesn't contain localhost, use it (for physical devices)
    if (envUrl) {
      return envUrl;
    }
    // Default for Android emulator
    return "http://10.0.2.2:3000/api";
  }
  
  // iOS simulator can use localhost
  return envUrl || "http://localhost:3000/api";
};

const BASE_URL = getBaseUrl();

// Log the base URL for debugging (remove in production)
if (__DEV__) {
  console.log('=== API Configuration ===');
  console.log('Platform:', Platform.OS);
  console.log('API Base URL:', BASE_URL);
  console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL || 'not set');
  console.log('========================');
}

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
  
  try {
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
  } catch (error) {
    // Handle network errors (connection refused, timeout, etc.)
    if (error.message === "Network request failed" || error.message.includes("fetch")) {
      const networkError = new Error(
        `Không thể kết nối đến server. Vui lòng kiểm tra:\n` +
        `1. Server đang chạy tại ${BASE_URL}\n` +
        `2. Địa chỉ IP trong client.js đúng với máy tính của bạn\n` +
        `3. Firewall không chặn kết nối`
      );
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
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



