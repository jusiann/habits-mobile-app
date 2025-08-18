import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set,get) => ({
    user: null,
    token: null,
    isLoading: false,
    isInitialized: false,

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

            if(!response.ok)
                throw new Error(data.message || "Registration failed");
            
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.accessToken);
            set({ user: data.user, token: data.accessToken, isLoading: false });
            
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
    
    login: async (username, email, password) => {
        try {
            set({ isLoading: true });
            const response = await fetch(`https://habits-mobile-app.onrender.com/api/auth/sign-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Login failed");

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.accessToken);
            set({ user: data.user, token: data.accessToken, isLoading: false });

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

    checkAuth: async () => {
        try{
            set({ isLoading: true });
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
            const user = userJson ? JSON.parse(userJson) : null;
            set({ user, token, isLoading: false, isInitialized: true });
        } catch (error) {
            set({ isLoading: false, isInitialized: true });
            return {
                success: false,
                message: error.message || "An error occurred during authentication",
            };
        }
    },

    logout: async () => {
        try {
            const token = get().token;
            if (token) {
                try {
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
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            set({ user: null, token: null });
            
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

}));