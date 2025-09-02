import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useHabitStore} from "./habit.store";
import {API_ENDPOINTS, makeAuthenticatedRequest} from "../constants/api.utils";
import {StorageUtils} from "../constants/storage.utils";

export const useAuthStore = create((set,get) => ({
    user: null,
    token: null,
    refreshToken: null,
    tokenExpirationTime: null,
    refreshTimer: null,
    isLoading: false,

    // API WRAPPER WITH AUTO REFRESH
    makeAuthenticatedRequest: async (url, options = {}) => {
        try {
            return await makeAuthenticatedRequest(url, options, useAuthStore);
        } catch (error) {
            throw new Error(error.message || "Authentication request failed");
        }
    },

    // REGISTER USER
    register: async (email, username, fullname, password) => {
        set({ 
            isLoading: true 
        });
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.SIGN_UP, {
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

            const expirationTime = await StorageUtils.saveAuthData(data.user, data.accessToken, data.refreshToken);
            set({ 
                user: data.user, 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                tokenExpirationTime: expirationTime,
                isLoading: false 
            });
            
            get().startAutoRefresh();
            return {
                success: true,
            };
        } catch (error) {
            set({ 
                isLoading: false 
            });
            return {
                success: false,
                message: error.message || "An error occurred during registration",
            };
        } finally {
            set({ 
                isLoading: false 
            });
        }
    },

    // LOGIN USER
    login: async (email, username, password) => {
        set({ 
            isLoading: true
        });
        try {
            let body = {};
            if (email) {
                body = { email, password };
            } else if (username) {
                body = { username, password };
            } else {
                throw new Error("Email or username is required");
            }

            const response = await fetch(API_ENDPOINTS.AUTH.SIGN_IN, {
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

            if (!response.ok) 
                throw new Error(data.message || data.error || "Login failed");

            const expirationTime = await StorageUtils.saveAuthData(data.user, data.accessToken, data.refreshToken);
            set({ 
                user: data.user, 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                tokenExpirationTime: expirationTime,
                isLoading: false 
            });

            get().startAutoRefresh();
            return {
                success: true,
            };
        } catch (error) {
            set({ 
                isLoading: false 
            });
            return {
                success: false,
                message: error.message || "An error occurred during login",
            };
        }
    },

    // REFRESH TOKEN
    refreshAccessToken: async () => {
        try {
            const {refreshToken} = get();
            console.log('Refresh token attempt - Current refresh token:', refreshToken ? 'Available' : 'Not available');
            
            if (!refreshToken) {
                console.error('No refresh token available, logging out');
                await get().logout();
                throw new Error("No refresh token available");
            }
            
            const response = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
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
                await get().logout();
                throw new Error("Invalid server response format");
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    await get().logout();
                }
                throw new Error(data.message || data.error || "Token refresh failed");
            }

            const expirationTime = await StorageUtils.updateTokens(data.accessToken, data.refreshToken);
            if (data.user)
                await StorageUtils.updateUser(data.user);

            set({ 
                token: data.accessToken, 
                refreshToken: data.refreshToken,
                tokenExpirationTime: expirationTime,
                user: data.user || get().user
            });

            return { 
                success: true 
            };
        } catch (error) {
            console.error("Token refresh failed:", error);
            if (error.message.includes("invalidated") || 
                error.message.includes("expired") || 
                error.message.includes("invalid")) {
                await get().logout();
            }
            return { 
                success: false, 
                message: error.message || "Token refresh failed" 
            };
        }
    },

    // START AUTO REFRESH TIMER
    startAutoRefresh: () => {
        const { tokenExpirationTime, refreshTimer, token, refreshToken } = get();
        
        console.log('Starting auto refresh - Token:', token ? 'Available' : 'Not available', 
                   'Refresh Token:', refreshToken ? 'Available' : 'Not available',
                   'Expiration Time:', tokenExpirationTime ? new Date(tokenExpirationTime).toISOString() : 'Not set');
        
        if (refreshTimer)
            clearTimeout(refreshTimer);
        
        if (!token || !refreshToken) {
            console.error('Missing token or refresh token, logging out');
            get().logout();
            return;
        }

        if (!tokenExpirationTime) {
            const newExpirationTime = Date.now() + (15 * 60 * 1000);
            set({ 
                tokenExpirationTime: 
                newExpirationTime 
            });
            return get().startAutoRefresh();
        }

        const currentTime = Date.now();
        const refreshTime = tokenExpirationTime - (2 * 60 * 1000);
        const timeUntilRefresh = refreshTime - currentTime;

        if (timeUntilRefresh <= 5000) {
            get().refreshAccessToken().then((result) => {
                if (result.success) {
                    get().startAutoRefresh();
                } else {
                    get().logout();
                }
            }).catch(() => {
                get().logout();
            });
            return;
        }

        // SET REFRESH TIMER
        const timer = setTimeout(async () => {
            try {
                const result = await get().refreshAccessToken();
                if (result.success) {
                    get().startAutoRefresh();
                } else {
                    await get().logout();
                }
            } catch (error) {
                console.error("Auto refresh failed:", error);
                await get().logout();
            }
        }, Math.min(timeUntilRefresh, 15 * 60 * 1000));

        set({ 
            refreshTimer: timer 
        }); 
    },

    // STOP AUTO REFRESH
    stopAutoRefresh: () => {
        const { refreshTimer } = get();
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            set({ 
                refreshTimer: null,
                tokenExpirationTime: null,
            });
        }
    },

    // LOGOUT USER
    logout: async () => {
        try {
            get().stopAutoRefresh();
            
            const token = get().token;
            if (token) {
                try {
                    await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                } catch (serverError) {
                    console.log("Server logout failed, but continuing with local logout:", serverError);
                }
            }

            get().clearStore();
            useHabitStore.getState().clearStore();
            await StorageUtils.clearAuthData();
            return {
                success: true,
                message: "Logged out successfully"
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Logout failed"
            };
        }
    },
    
    // CHECK AUTH STATUS
    checkAuth: async () => {
        try {
            const {user, token, refreshToken, tokenExpirationTime} = await StorageUtils.loadAuthData();
            
            console.log('CheckAuth - Loaded from storage:', {
                hasUser: !!user,
                hasToken: !!token,
                hasRefreshToken: !!refreshToken,
                tokenExpiration: tokenExpirationTime ? new Date(tokenExpirationTime).toISOString() : 'Not set'
            });
            
            if (token && refreshToken) {
                set({ 
                    user, 
                    token, 
                    refreshToken,
                    tokenExpirationTime
                });
                
                try {
                    const response = await fetch(
                        API_ENDPOINTS.AUTH.ME,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Latest user data:', data);
                        
                        // USE SERVER DATA DIRECTLY WITHOUT MERGING
                        const updatedUser = data.user;

                        // REMOVE UNDEFINED VALUES
                        Object.keys(updatedUser).forEach(key => {
                            if (updatedUser[key] === undefined) {
                                delete updatedUser[key];
                            }
                        });

                        // UPDATE STORAGE
                        await StorageUtils.updateUser(updatedUser);
                        set({ 
                            user: updatedUser 
                        });
                    } else {
                        throw new Error('Failed to fetch user data');
                    }
                } catch (error) {
                    set({
                        user: null,
                        token: null,
                        refreshToken: null,
                        tokenExpirationTime: null
                    });
                    return {
                        success: false,
                        message: error.message || "Failed to fetch user data"
                    };  
                }
                
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
                set({ 
                    user: null, 
                    token: null, 
                    refreshToken: null, 
                    tokenExpirationTime: null 
                });
                return { 
                    success: false, 
                    message: "No token found" 
                };
            }
        } catch (error) {
            set({ 
                user: null, 
                token: null, 
                refreshToken: null, 
                tokenExpirationTime: null 
            });
            return {
                success: false,
                message: error.message || "An error occurred during authentication",
            };
        }
    },

    // SEND RESET CODE
    sendResetCode: async (email) => {
        set({ 
            isLoading: true 
        });
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
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

            if (!response.ok)
                throw new Error(data.message || data.error || "Failed to send reset code");

            return {
                success: true,
                message: "Reset code sent to your email"
            };
        } catch (error) {
            set({
                isLoading: false
            });
            return {
                success: false,
                message: error.message || "Failed to send reset code"
            };
        } finally {
            set({ 
                isLoading: false 
            });
        }
    },

    // VERIFY RESET CODE
    verifyResetCode: async (email, resetCode) => {
        set({ 
            isLoading: true 
        });
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.CHECK_RESET_TOKEN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, resetCode }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                return {
                    success: true,
                    message: "Reset code verified successfully"
                };
            } else {
                throw new Error(data.message || 'Invalid reset code');
            }
        } catch (error) {
            set({
                isLoading: false
            });
            return {
                success: false,
                message: error.message || "Failed to verify reset code"
            };
        } finally {
            set({ 
                isLoading: false 
            });
        }
    },

    // RESET PASSWORD
    resetPassword: async (email, resetCode, newPassword) => {
        set({ 
            isLoading: true 
        });
        try {
            const checkResponse = await fetch(API_ENDPOINTS.AUTH.CHECK_RESET_TOKEN, {
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

            if (!checkResponse.ok || !checkData.success)
                throw new Error(checkData.message || checkData.error || "Invalid reset code");

            const resetResponse = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
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

            if (!resetResponse.ok || !resetData.success)
                throw new Error(resetData.message || resetData.error || "Failed to reset password");
            
            return {
                success: true,
                message: "Password reset successfully"
            };
        } catch (error) {
            set({ 
                isLoading: false 
            });
            return {
                success: false,
                message: error.message || "Failed to reset password"
            };
        } finally {
            set({ 
                isLoading: false 
            });
        }
    },

    // UPDATE PROFILE
    updateProfile: async ({ fullname, gender, height, weight, age, profilePicture, timezone, currentPassword, newPassword }) => {
        set({ 
            isLoading: true 
        });
        try {
            const response = await get().makeAuthenticatedRequest(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
                method: "POST",
                body: JSON.stringify({
                    fullname,
                    gender,
                    height,
                    weight,
                    age,
                    profilePicture,
                    timezone,
                    currentPassword,
                    newPassword
                }),
            });

            let data;
            try {
                data = await response.json();
                console.log('Update profile response:', data);
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!response.ok)
                throw new Error(data.message || data.error || "Profile update failed");
            
            // UPDATE USER IN STORAGE AND STATE
            const updatedUser = {
                ...get().user,
                fullname,
                gender,
                height: height ? Number(height) : undefined,
                weight: weight ? Number(weight) : undefined,
                age: age ? Number(age) : undefined,
                profilePicture,
                timezone
            };

            // DELETE UNDEFINED VALUES
            Object.keys(updatedUser).forEach(key => {
                if (updatedUser[key] === undefined) {
                    delete updatedUser[key];
                }
            });

            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            set({ 
                user: updatedUser,
                isLoading: false 
            });

            return {
                success: true,
                message: data.message || "Profile updated successfully"
            };
        } catch (error) {
            set({ 
                isLoading: false 
            });
            return {
                success: false,
                message: error.message || "Profile update failed"
            };
        } finally {
            set({ 
                isLoading: false 
            });
        }
    },

    // CHANGE PASSWORD
    changePassword: async (currentPassword, newPassword) => {
        set({ 
            isLoading: true 
        });
        try {
            const response = await get().makeAuthenticatedRequest(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
                method: "POST",
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid server response format");
            }

            if (!response.ok)
                throw new Error(data.message || data.error || "Password change failed");
            
            // UPDATE USER IN STORAGE AND STATE IF USER DATA IS RETURNED
            if (data.user) {
                await AsyncStorage.setItem("user", JSON.stringify(data.user));
                set({ 
                    user: data.user 
                });
            }

            return {
                success: true,
                message: data.message || "Password changed successfully"
            };
        } catch (error) {
            set({ 
                isLoading: false 
            });
            return {
                success: false,
                message: error.message || "Password change failed"
            };
        } finally {
            set({ 
                isLoading: false 
            });
        }
    },

    // CLEAR STORE
    clearStore: () => {
        get().stopAutoRefresh();
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