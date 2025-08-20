// API Configuration
// Production болон development environment-д зориулсан тохиргоо
export const API_CONFIG = {
  BACKEND_URL:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://backend-htk90mjru-kherlenchimegs-projects.vercel.app"
      : process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL || "http://localhost:5000"),
  FRONTEND_URL:
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://frontend-po2elhd14-kherlenchimegs-projects.vercel.app"
      : process.env.NEXT_PUBLIC_LOCAL_FRONTEND_URL || "http://localhost:3000"),
};

// Preview deployment-д зориулсан backend URL
export const PREVIEW_BACKEND_URL =
  "https://backend-plf28jmz7-kherlenchimegs-projects.vercel.app";

// Backend API endpoints
export const API_ENDPOINTS = {
  ORDERS: `${
    process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"
      ? PREVIEW_BACKEND_URL
      : API_CONFIG.BACKEND_URL
  }/api/orders`,
  TABLES: `${
    process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"
      ? PREVIEW_BACKEND_URL
      : API_CONFIG.BACKEND_URL
  }/api/tables`,
  MENU: `${
    process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"
      ? PREVIEW_BACKEND_URL
      : API_CONFIG.BACKEND_URL
  }/api/menu`,
  CATEGORIES: `${
    process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"
      ? PREVIEW_BACKEND_URL
      : API_CONFIG.BACKEND_URL
  }/api/categories`,
  RESERVATIONS: `${
    process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"
      ? PREVIEW_BACKEND_URL
      : API_CONFIG.BACKEND_URL
  }/api/reservations`,
  RESTAURANT: `${
    process.env.NEXT_PUBLIC_PREVIEW_MODE === "true"
      ? PREVIEW_BACKEND_URL
      : API_CONFIG.BACKEND_URL
  }/api/restaurant`,
};

// API helper functions
export const apiHelpers = {
  // GET request helper
  async get(endpoint: string) {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // POST request helper
  async post(endpoint: string, data: any) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // PUT request helper
  async put(endpoint: string, data: any) {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // DELETE request helper
  async delete(endpoint: string) {
    const response = await fetch(endpoint, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
