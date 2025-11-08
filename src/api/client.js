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

export async function apiGet(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = await buildHeaders(opts.auth === true);
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
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

export async function apiPut(path, body, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = await buildHeaders(opts.auth === true);
  
  try {
    const res = await fetch(url, {
      method: "PUT",
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

export async function apiDelete(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = await buildHeaders(opts.auth === true);
  
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers,
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

export const shopApi = {
  async logout() {
    return apiPost("/auth/logout", {}, { auth: true });
  },
  
  // Wallet
  async getWallet() {
    return apiGet("/wallet", { auth: true });
  },
  async deposit({ amount }) {
    return apiPost("/wallet/deposit", { amount }, { auth: true });
  },
  
  // Packages
  async getAvailablePackages() {
    return apiGet("/packages", { auth: false }); // Public endpoint
  },
  async getMyPackages() {
    return apiGet("/packages/shop/my-packages", { auth: true });
  },
  async purchasePackage({ packageId }) {
    return apiPost("/packages/purchase", { packageId }, { auth: true });
  },
  
  // Posts (Products)
  async getMyPosts() {
    return apiGet("/products/shop/my-products", { auth: true });
  },
  async createPost({ title, description, price, stock, category, images }) {
    // Backend expects: name, description, images, category, brand, price, stock, specs
    return apiPost(
      "/products",
      {
        name: title,
        description,
        price: { amount: price },
        category,
        images,
        brand: "",
        stock: stock || 1,
        specs: {}
      },
      { auth: true }
    );
  },
  async updatePost(postId, { title, description, price, stock, category, images }) {
    // Backend expects: name, description, images, category, brand, price, stock, specs
    return apiPut(
      `/products/${postId}`,
      {
        name: title,
        description,
        price: typeof price === 'object' ? price : { amount: price },
        stock,
        category,
        images
      },
      { auth: true }
    );
  },
  async updateProductStatus(postId, { status }) {
    return apiPut(
      `/products/${postId}`,
      { status },
      { auth: true }
    );
  },
  async deletePost(postId) {
    return apiDelete(`/products/${postId}`, { auth: true });
  },

  // Contacts
  async getContacts(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);
    
    const queryString = queryParams.toString();
    const path = `/contacts/shop/my-contacts${queryString ? `?${queryString}` : ""}`;
    return apiGet(path, { auth: true });
  },
  async updateContactStatus(contactId, { status }) {
    return apiPut(`/contacts/${contactId}/status`, { status }, { auth: true });
  },
};

export const adminApi = {
  async logout() {
    return apiPost("/auth/logout", {}, { auth: true });
  },
  
  // Stats
  async getStats() {
    return apiGet("/admin/stats", { auth: true });
  },
  
  // Users
  async getUsers() {
    return apiGet("/admin/users", { auth: true });
  },
  async banUser(userId, { isBanned }) {
    return apiPut(`/admin/users/${userId}/ban`, { isBanned }, { auth: true });
  },
  
  // Products
  async getProducts(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);
    
    const queryString = queryParams.toString();
    const path = `/admin/products${queryString ? `?${queryString}` : ""}`;
    return apiGet(path, { auth: true });
  },
  async approveProduct(productId, { status, rejectedReason }) {
    return apiPut(`/products/${productId}/approve`, { status, rejectedReason }, { auth: true });
  },
  
  // Revenue
  async getRevenue() {
    return apiGet("/admin/revenue", { auth: true });
  },
};

export const customerApi = {
  async logout() {
    return apiPost("/auth/logout", {}, { auth: true });
  },
  
  // Profile
  async getProfile() {
    return apiGet("/users/profile", { auth: true });
  },
  async updateProfile({ fullName, phoneNumber, address, dateOfBirth }) {
    return apiPut("/users/profile", { fullName, phoneNumber, address, dateOfBirth }, { auth: true });
  },
  
  // Products
  async getProducts(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.brand) queryParams.append("brand", filters.brand);
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);
    
    const queryString = queryParams.toString();
    const path = `/products${queryString ? `?${queryString}` : ""}`;
    return apiGet(path, { auth: false }); // Public endpoint
  },
  async getProductById(productId) {
    return apiGet(`/products/${productId}`, { auth: false }); // Public endpoint
  },
  
  // Contact Shop
  async checkContact(productId, customerEmail = null) {
    const queryParams = new URLSearchParams();
    if (customerEmail) queryParams.append("customerEmail", customerEmail);
    const queryString = queryParams.toString();
    const path = `/contacts/check/${productId}${queryString ? `?${queryString}` : ""}`;
    // Try with auth first, fallback to no auth
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        return apiGet(path, { auth: true });
      }
    } catch (e) {
      // Continue without auth
    }
    return apiGet(path, { auth: false });
  },
  async contactShop(productId, { customerName, customerPhone, customerEmail, message }) {
    // Try to get token from AsyncStorage, but don't fail if not available
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        return apiPost(
          "/contacts",
          {
            productId,
            customerName,
            customerPhone,
            customerEmail,
            message,
          },
          { auth: true }
        );
      }
    } catch (e) {
      // Continue without auth
    }
    // If no token, send without auth
    return apiPost(
      "/contacts",
      {
        productId,
        customerName,
        customerPhone,
        customerEmail,
        message,
      },
      { auth: false }
    );
  },
};



