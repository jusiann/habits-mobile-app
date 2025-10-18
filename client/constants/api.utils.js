// FOR ONLINE TEST
// export const API_BASE_URL = 'https://habits-mobile-app.onrender.com/api';

// export const API_LOCAL_BASE_URL = 'http://localhost:3000/api';


// FOR LOCAL TEST ANDROID EMULATOR
export const API_BASE_URL = 'http://192.168.1.3:3000/api';

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
    MONTHLY: (year, month) => `${API_BASE_URL}/habits/monthly/${year}/${month}`,
    PROGRESS: (habitId, queryParams = '') => `${API_BASE_URL}/habits/${habitId}/progress${queryParams ? `?${queryParams}` : ''}`,
    UPDATE: (habitId) => `${API_BASE_URL}/habits/${habitId}`,
    DELETE: (habitId) => `${API_BASE_URL}/habits/${habitId}`
    ,
    GOALS: {
      LIST: `${API_BASE_URL}/habits/goals`,
      CREATE: `${API_BASE_URL}/habits/goals`,
      DELETE: (goalId) => `${API_BASE_URL}/habits/goals/${goalId}`
    }
  }
};

// MAKE AUTHENTICATED REQUEST
export const makeAuthenticatedRequest = async (url, options = {}, authStore) => {
  const authState = authStore.getState();
  const {token, tokenExpirationTime, user} = authState;
  
  if (!token || !user) {
      console.warn('makeAuthenticatedRequest: No token or user available');
      throw new Error("No authentication token available");
  }
  
  // CHECK TOKEN EXPIRY
  const currentTime = Date.now();
  const twoMinutes = 2 * 60 * 1000;
  
  if (tokenExpirationTime && (currentTime >= tokenExpirationTime - twoMinutes)) {
      console.log('Token needs refresh, attempting refresh...');
      const refreshResult = await authStore.getState().refreshAccessToken();
      if (!refreshResult.success) {
          console.error('Token refresh failed, logging out');
          throw new Error(refreshResult.message || "Session expired. Please log in again.");
      }
  }

  // PREPARE REQUEST WITH AUTH HEADER
  const currentToken = authStore.getState().token;
  const requestOptions = {
      ...options,
      headers: {
          "Content-Type": "application/json",
          ...options.headers,
          "Authorization": `Bearer ${currentToken}`,
      },
  };

  try {
      const response = await fetch(url, requestOptions);
      
      // HANDLE 401 WITH ONE RETRY ONLY
      if (response.status === 401) {
          console.log('Got 401, attempting token refresh...');
          const refreshResult = await authStore.getState().refreshAccessToken();
          if (refreshResult.success) {
              const newToken = authStore.getState().token;
              const retryOptions = {
                  ...requestOptions,
                  headers: {
                      ...requestOptions.headers,
                      "Authorization": `Bearer ${newToken}`,
                  },
              };
              return await fetch(url, retryOptions);
          } else {
              console.error('Token refresh failed on 401, user will be logged out');
              throw new Error(refreshResult.message || "Session expired. Please log in again.");
          }
      }
      return response;
  } catch (error) {
      if (error.message.includes("Network request failed") || error.message.includes("fetch")) {
          throw new Error("Network connection failed. Please check your internet connection.");
      }
      throw error;
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
  getRequestConfig,
  makeAuthenticatedRequest
};