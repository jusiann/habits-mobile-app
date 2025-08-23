import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set,get) => ({
    user: null,
    token: null,
    refreshToken: null,
    tokenExpirationTime: null,
    refreshTimer: null,
    isLoading: false,

    // REGISTER USER
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

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if(!response.ok) {
                const errorMessage = data.error || data.message || "Registration failed";
                throw new Error(errorMessage);
            }
            // SAVE TO STORAGE
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            // TOKEN EXPIRES IN 15 MINUTES
            const expirationTime = Date.now() + (15 * 60 * 1000);
            await AsyncStorage.setItem("tokenExpirationTime", expirationTime.toString());
            // UPDATE STATE
            set({ 
                user: data.user, 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                tokenExpirationTime: expirationTime,
                isLoading: false 
            });
            // START AUTO REFRESH
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

    // LOGIN USER
    login: async (email, username, password) => {
        try {
            set({ isLoading: true });
            // SEND EMAIL OR USERNAME
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

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!response.ok) throw new Error(data.message || data.error || "Login failed");

            // SAVE TO STORAGE
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            
            // TOKEN EXPIRES IN 15 MINUTES
            const expirationTime = Date.now() + (15 * 60 * 1000);
            await AsyncStorage.setItem("tokenExpirationTime", expirationTime.toString());
            
            // UPDATE STATE
            set({ 
                user: data.user, 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                tokenExpirationTime: expirationTime,
                isLoading: false 
            });

            // START AUTO REFRESH
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

    // REFRESH TOKEN
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

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || "Token refresh failed");
            }

            // UPDATE TOKENS IN STORAGE
            await AsyncStorage.setItem("token", data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            
            // TOKEN EXPIRES IN 15 MINUTES
            const expirationTime = Date.now() + (15 * 60 * 1000);
            await AsyncStorage.setItem("tokenExpirationTime", expirationTime.toString());

            // UPDATE STATE
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

    // START AUTO REFRESH TIMER
    startAutoRefresh: () => {
        const { tokenExpirationTime, refreshTimer } = get();
        
        // CLEAR EXISTING TIMER
        if (refreshTimer)
            clearTimeout(refreshTimer);
        
        if (!tokenExpirationTime) 
            return;

        // REFRESH 2 MINUTES BEFORE EXPIRY
        const currentTime = Date.now();
        const refreshTime = tokenExpirationTime - (2 * 60 * 1000);
        const timeUntilRefresh = refreshTime - currentTime;

        // REFRESH IMMEDIATELY IF EXPIRED
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

        // SET REFRESH TIMER
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

    // STOP AUTO REFRESH TIMER
    stopAutoRefresh: () => {
        const { refreshTimer } = get();
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            set({ refreshTimer: null });
        }
    },

    // LOGOUT USER
    logout: async () => {
        try {
            // STOP AUTO REFRESH
            get().stopAutoRefresh();
            
            const token = get().token;
            if (token) {
                try {
                    // BLACKLIST TOKEN ON SERVER
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
            // CLEAR LOCAL STORAGE
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("refreshToken");
            await AsyncStorage.removeItem("tokenExpirationTime");
            
            // CLEAR STORE STATE
            get().clearStore();
            
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
    
    // CHECK AUTH STATUS
    checkAuth: async () => {
        try {
            // LOAD FROM STORAGE
            const userJson = await AsyncStorage.getItem("user");
            const token = await AsyncStorage.getItem("token");
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            const tokenExpirationTimeStr = await AsyncStorage.getItem("tokenExpirationTime");
              
            const user = userJson ? JSON.parse(userJson) : null;
            const tokenExpirationTime = tokenExpirationTimeStr ? parseInt(tokenExpirationTimeStr) : null;
            
            if (token && refreshToken) {
                // RESTORE STATE
                set({ 
                    user, 
                    token, 
                    refreshToken,
                    tokenExpirationTime
                });
                
                // CHECK IF TOKEN NEEDS REFRESH
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
                // NO TOKENS FOUND
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

    // SEND RESET CODE
    sendResetCode: async (email) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`https://habits-mobile-app.onrender.com/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to send reset code");
            }

            return {
                success: true,
                message: "Reset code sent to your email"
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to send reset code"
            };
        } finally {
            set({ isLoading: false });
        }
    },

    // RESET PASSWORD
    resetPassword: async (email, resetCode, newPassword) => {
        set({ isLoading: true });
        try {
            // CHECK RESET CODE AND GET TEMPORARY TOKEN
            const checkResponse = await fetch(`https://habits-mobile-app.onrender.com/api/auth/check-reset-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ resetCode }),
            });

            let checkData;
            try {
                checkData = await checkResponse.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!checkResponse.ok || !checkData.success) {
                throw new Error(checkData.message || checkData.error || "Invalid reset code");
            }

            // USE TEMPORARY TOKEN TO RESET PASSWORD
            const resetResponse = await fetch(`https://habits-mobile-app.onrender.com/api/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    password: newPassword, 
                    temporaryToken: checkData.temporaryToken 
                }),
            });

            let resetData;
            try {
                resetData = await resetResponse.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!resetResponse.ok || !resetData.success) {
                throw new Error(resetData.message || resetData.error || "Failed to reset password");
            }

            return {
                success: true,
                message: "Password reset successfully"
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to reset password"
            };
        } finally {
            set({ isLoading: false });
        }
    },

    // HELPER FUNCTIONS
    isAuthenticated: () => {
        const { token } = get();
        return !!token;
    },

    // API WRAPPER WITH AUTO REFRESH
    makeAuthenticatedRequest: async (url, options = {}) => {
        const { token, tokenExpirationTime } = get();
        
        if (!token) {
            throw new Error("No authentication token available");
        }

        // CHECK TOKEN EXPIRY
        const currentTime = Date.now();
        const twoMinutes = 2 * 60 * 1000;
        
        if (tokenExpirationTime && (currentTime >= tokenExpirationTime - twoMinutes)) {
            const refreshResult = await get().refreshAccessToken();
            if (!refreshResult.success) {
                await get().logout();
                throw new Error("Session expired. Please log in again.");
            }
        }

        // PREPARE REQUEST WITH AUTH HEADER
        const currentToken = get().token;
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

            // HANDLE 401 WITH RETRY
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
        } catch (error) {
            console.error("Network request failed:", error);
            if (error.message.includes("Network request failed") || error.message.includes("fetch")) {
                throw new Error("Network connection failed. Please check your internet connection.");
            }
            throw error;
        }
    },

    // UPDATE PROFILE
    updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
            const response = await get().makeAuthenticatedRequest(
                `https://habits-mobile-app.onrender.com/api/auth/update-profile`,
                {
                    method: "POST",
                    body: JSON.stringify(profileData),
                }
            );

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || "Profile update failed");
            }

            // UPDATE USER IN STORAGE AND STATE
            if (data.user) {
                await AsyncStorage.setItem("user", JSON.stringify(data.user));
                set({ 
                    user: data.user,
                    isLoading: false 
                });
            }

            return {
                success: true,
                message: data.message || "Profile updated successfully"
            };
        } catch (error) {
            console.error("Update profile error:", error);
            set({ isLoading: false });
            return {
                success: false,
                message: error.message || "Profile update failed"
            };
        } finally {
            set({ isLoading: false });
        }
    },

    // CHANGE PASSWORD
    changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        try {
            const response = await get().makeAuthenticatedRequest(
                `https://habits-mobile-app.onrender.com/api/auth/update-profile`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    }),
                }
            );

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || "Password change failed");
            }

            // UPDATE USER IN STORAGE AND STATE IF USER DATA IS RETURNED
            if (data.user) {
                await AsyncStorage.setItem("user", JSON.stringify(data.user));
                set({ user: data.user });
            }

            return {
                success: true,
                message: data.message || "Password changed successfully"
            };
        } catch (error) {
            console.error("Change password error:", error);
            set({ isLoading: false });
            return {
                success: false,
                message: error.message || "Password change failed"
            };
        } finally {
            set({ isLoading: false });
        }
    },

    // CLEAR STORE
    clearStore: () => {
        // STOP AUTO REFRESH
        get().stopAutoRefresh();
        
        // CLEAR STATE
        set({
            user: null,
            token: null,
            refreshToken: null,
            tokenExpirationTime: null,
            refreshTimer: null,
            isLoading: false
        });
    },

}));