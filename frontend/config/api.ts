// API Configuration
// IP хаягийг энд өөрчлөх хэрэгтэй
export const API_CONFIG = {
  BACKEND_URL: "http://192.168.0.102:5000",
  FRONTEND_URL: "http://192.168.0.102:3000",
};

// Backend API endpoints
export const API_ENDPOINTS = {
  ORDERS: `${API_CONFIG.BACKEND_URL}/api/orders`,
  TABLES: `${API_CONFIG.BACKEND_URL}/api/tables`,
  MENU: `${API_CONFIG.BACKEND_URL}/api/menu`,
  CATEGORIES: `${API_CONFIG.BACKEND_URL}/api/categories`,
  RESERVATIONS: `${API_CONFIG.BACKEND_URL}/api/reservations`,
  RESTAURANT: `${API_CONFIG.BACKEND_URL}/api/restaurant`,
};
