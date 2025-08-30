export const API_BASE_URL = 'https://habits-mobile-app.onrender.com/api';

export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: `${API_BASE_URL}/auth/sign-up`,
    SIGN_IN: `${API_BASE_URL}/auth/sign-in`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    CHECK_RESET_TOKEN: `${API_BASE_URL}/auth/check-reset-token`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/update-profile`
  },
  HABITS: {
    PRESETS: `${API_BASE_URL}/habits/presets`,
    DASHBOARD: `${API_BASE_URL}/habits/dashboard`,
    ADD: `${API_BASE_URL}/habits/add`,
    INCREMENT: (habitId) => `${API_BASE_URL}/habits/${habitId}/increment`,
    DETAIL: (habitId) => `${API_BASE_URL}/habits/${habitId}`,
    LOGS_BY_DATE: (date) => `${API_BASE_URL}/habits/logs-by-date?date=${date}`,
    PROGRESS: (habitId, queryParams = '') => `${API_BASE_URL}/habits/${habitId}/progress${queryParams ? `?${queryParams}` : ''}`,
    UPDATE: (habitId) => `${API_BASE_URL}/habits/${habitId}`,
    DELETE: (habitId) => `${API_BASE_URL}/habits/${habitId}`
  }
};

export const getApiConfig = () => {
  const environment = process.env.NODE_ENV || 'production';
  
  switch (environment) {
    case 'development':
      return {
        baseUrl: 'http://localhost:3000/api',
        timeout: 10000
      };
    case 'staging':
      return {
        baseUrl: 'https://habits-mobile-app-staging.onrender.com/api',
        timeout: 15000
      };
    case 'production':
    default:
      return {
        baseUrl: API_BASE_URL,
        timeout: 20000
      };
  }
};

export const getRequestConfig = (options = {}) => {
  const config = getApiConfig();
  
  return {
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiConfig,
  getRequestConfig
};