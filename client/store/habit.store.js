import { create } from "zustand";
import { useAuthStore } from "./auth.store";

export const useHabitStore = create((set, get) => ({
  habits: [],
  presets: [],
  isLoading: false,
  error: null,

  fetchPresets: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const authHeaders = useAuthStore.getState().getAuthHeader();
      
      const response = await fetch('https://habits-mobile-app.onrender.com/api/habits/presets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const data = await response.json();

      if (response.ok) {
        const cleanPresets = data.data.presets.health || [];
        
        set({ 
          presets: cleanPresets, 
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error: data.message, isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (_error) {
      set({ error: 'Network error', isLoading: false });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  fetchHabits: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const authHeaders = useAuthStore.getState().getAuthHeader();
      
      const response = await fetch('https://habits-mobile-app.onrender.com/api/habits/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const data = await response.json();

      if (response.ok) {
        const cleanHabits = data.data.habits || [];
        set({ 
          habits: cleanHabits, 
          isLoading: false 
        });
        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (_error) {
      set({ error: 'Network error', isLoading: false });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  createHabit: async (habitData) => {
    try {
      set({ isLoading: true, error: null });
      
      const authHeaders = useAuthStore.getState().getAuthHeader();
      
      console.log('Creating habit with data:', habitData);
      
      const response = await fetch('https://habits-mobile-app.onrender.com/api/habits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(habitData)
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        await get().fetchHabits();
        set({ isLoading: false });
        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('CreateHabit error:', error);
      set({ error: 'Network error', isLoading: false });
      return { success: false, message: `Network error: ${error.message}` };
    }
  },

  incrementHabit: async (habitId) => {
    try {
      const authHeaders = useAuthStore.getState().getAuthHeader();
      
      const response = await fetch(`https://habits-mobile-app.onrender.com/api/habits/${habitId}/increment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const data = await response.json();

      if (response.ok) {
        await get().fetchHabits();
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (_error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  clearStore: () => {
    set({
      habits: [],
      presets: [],
      isLoading: false,
      error: null
    });
  }
}));
