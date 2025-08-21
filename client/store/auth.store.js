import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set,get) => ({
    // Auth state
    user: null,
    token: null,
    refreshToken: null,
    tokenExpirationTime: null,
    refreshTimer: null,
    isLoading: false,

    // Register - Create a new user
    register: async (email, username, fullname, password) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`https://habits-mobile-app.onrender.com/api/auth/sign-up`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    email, 
                    username, 
                    fullname, 
                    password 
                }),
            });

            const data = await response.json();

            if(!response.ok) {
                const errorMessage = data.error || data.message || "Registration failed";
                throw new Error(errorMessage);
            }
            // Save to storage
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            // Calculate token expiration time (15 minutes from now)
            const expirationTime = Date.now() + (15 * 60 * 1000);
            await AsyncStorage.setItem("tokenExpirationTime", expirationTime.toString());
            // Update state
            set({ 
                user: data.user, 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                tokenExpirationTime: expirationTime,
                isLoading: false 
            });
            // Start auto refresh
            get().startAutoRefresh();
            return {
                success: true,
            };
        } catch (error) {
            set({ isLoading: false });
            return {
                success: false,
                message: error.message || "An error occurred during registration",
            };
        } finally {
            set({ isLoading: false });
        }
    },

    // Login - Enter session with existing user
    login: async (email, username, password) => {
        try {
            set({ isLoading: true });
            // Sadece email veya username gönder
            let body = {};
            if (email) {
                body = { email, password };
            } else if (username) {
                body = { username, password };
            }
            const response = await fetch(`https://habits-mobile-app.onrender.com/api/auth/sign-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Login failed");

            // Save to storage
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            
            // Calculate token expiration time (15 minutes from now)
            const expirationTime = Date.now() + (15 * 60 * 1000);
            await AsyncStorage.setItem("tokenExpirationTime", expirationTime.toString());
            
            // Update state
            set({ 
                user: data.user, 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                tokenExpirationTime: expirationTime,
                isLoading: false 
            });

            // Start auto refresh
            get().startAutoRefresh();

            return {
                success: true,
            };
        } catch (error) {
            set({ isLoading: false });
            return {
                success: false,
                message: error.message || "An error occurred during login",
            };
        }
    },

    // Refresh Access Token - Using refresh token
    refreshAccessToken: async () => {
        try {
            const { refreshToken } = get();
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await fetch(`https://habits-mobile-app.onrender.com/api/auth/refresh-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Token refresh failed");
            }

            // Update tokens in storage
            await AsyncStorage.setItem("token", data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            
            // Calculate new expiration time (15 minutes from now)
            const expirationTime = Date.now() + (15 * 60 * 1000);
            await AsyncStorage.setItem("tokenExpirationTime", expirationTime.toString());

            // Update state
            set({ 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                tokenExpirationTime: expirationTime,
                user: data.user 
            });

            return { 
                success: true 
            };
        } catch (error) {
            console.error("Token refresh failed:", error);
            return { 
                success: false, 
                message: error.message || "Token refresh failed" 
            };
        }
    },

    // Start Auto Refresh Timer (13 minutes before expiry)
    startAutoRefresh: () => {
        const { tokenExpirationTime, refreshTimer } = get();
        
        // Clear existing timer
        if (refreshTimer)
            clearTimeout(refreshTimer);
        
        if (!tokenExpirationTime) 
            return;

        // Calculate when to refresh (2 minutes before expiration)
        const currentTime = Date.now();
        const refreshTime = tokenExpirationTime - (2 * 60 * 1000);
        const timeUntilRefresh = refreshTime - currentTime;

        // If token is already expired or will expire very soon, refresh immediately
        if (timeUntilRefresh <= 0) {
            get().refreshAccessToken().then((result) => {
                if (result.success) {
                    get().startAutoRefresh();
                } else {
                    get().logout();
                }
            });
            return;
        }

        // Set timer to refresh token
        const timer = setTimeout(async () => {
            const result = await get().refreshAccessToken();
            if (result.success) {
                get().startAutoRefresh();
            } else {
                await get().logout();
            }
        }, timeUntilRefresh);

        set({ refreshTimer: timer }); 
    },

    // Stop Auto Refresh Timer
    stopAutoRefresh: () => {
        const { refreshTimer } = get();
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            set({ refreshTimer: null });
        }
    },

    // Logout user and clear all data
    logout: async () => {
        try {
            // Stop auto refresh
            get().stopAutoRefresh();
            
            const token = get().token;
            if (token) {
                try {
                    // Blacklist token on server
                    await fetch(`https://habits-mobile-app.onrender.com/api/auth/logout`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                } catch (serverError) {
                    console.warn("Server logout failed, but continuing with local logout:", serverError);
                }
            }
            // Clear local storage
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("refreshToken");
            await AsyncStorage.removeItem("tokenExpirationTime");
            
            // Clear state
            set({ 
                user: null, 
                token: null, 
                refreshToken: null, 
                tokenExpirationTime: null,
                refreshTimer: null
            });
            
            return {
                success: true,
                message: "Logged out successfully"
            };
        } catch (error) {
            console.error("Error logging out:", error);
            return {
                success: false,
                message: error.message || "Logout failed"
            };
        }
    },
    
    // Check auth status on app start
    checkAuth: async () => {
        try {
            // Load from storage
            const userJson = await AsyncStorage.getItem("user");
            const token = await AsyncStorage.getItem("token");
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            const tokenExpirationTimeStr = await AsyncStorage.getItem("tokenExpirationTime");
              
            const user = userJson ? JSON.parse(userJson) : null;
            const tokenExpirationTime = tokenExpirationTimeStr ? parseInt(tokenExpirationTimeStr) : null;
            
            if (token && refreshToken) {
                // Restore state
                set({ 
                    user, 
                    token, 
                    refreshToken,
                    tokenExpirationTime
                });
                
                // Check if token needs refresh
                const currentTime = Date.now();
                const twoMinutes = 2 * 60 * 1000;
                
                if (tokenExpirationTime && (currentTime >= tokenExpirationTime - twoMinutes)) {
                    const refreshResult = await get().refreshAccessToken();
                    if (refreshResult.success) {
                        get().startAutoRefresh();
                        return { success: true };
                    } else {
                        await get().logout();
                        return { success: false, message: "Session expired" };
                    }
                } else {
                    get().startAutoRefresh();
                    return { 
                        success: true 
                    };
                }
            } else {
                // No tokens found
                set({ user: null, token: null, refreshToken: null, tokenExpirationTime: null });
                return { 
                    success: false, 
                    message: "No token found" 
                };
            }
        } catch (error) {
            set({ user: null, token: null, refreshToken: null, tokenExpirationTime: null });
            return {
                success: false,
                message: error.message || "An error occurred during authentication",
            };
        }
    },

    // Helper functions
    isAuthenticated: () => {
        const { token } = get();
        return !!token;
    },

    // Smart API wrapper with auto refresh
    makeAuthenticatedRequest: async (url, options = {}) => {
        const { token, tokenExpirationTime } = get();
        
        if (!token) {
            throw new Error("No authentication token available");
        }

        // Check token expiry and refresh if needed
        const currentTime = Date.now();
        const twoMinutes = 2 * 60 * 1000;
        
        if (tokenExpirationTime && (currentTime >= tokenExpirationTime - twoMinutes)) {
            const refreshResult = await get().refreshAccessToken();
            if (!refreshResult.success) {
                await get().logout();
                throw new Error("Session expired. Please log in again.");
            }
        }

        // Prepare request with auth header
        const currentToken = get().token;
        const requestOptions = {
            ...options,
            headers: {
                ...options.headers,
                "Authorization": `Bearer ${currentToken}`,
            },
        };

        // Auto add Content-Type for requests with body
        if (options.body && !options.headers?.['Content-Type'] && !options.headers?.['content-type']) {
            requestOptions.headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, requestOptions);

        // Handle 401 with retry mechanism
        if (response.status === 401) {
            const refreshResult = await get().refreshAccessToken();
            if (refreshResult.success) {
                const newToken = get().token;
                const retryOptions = {
                    ...requestOptions,
                    headers: {
                        ...requestOptions.headers,
                        "Authorization": `Bearer ${newToken}`,
                    },
                };
                return await fetch(url, retryOptions);
            } else {
                await get().logout();
                throw new Error("Session expired. Please log in again.");
            }
        }
        return response;
    },

}));