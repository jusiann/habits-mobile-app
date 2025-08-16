import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set,get) => ({
    user: null,
    token: null,
    isLoading: false,

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
    }
}));