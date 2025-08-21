import { create } from "zustand";
import { useAuthStore } from "./auth.store";

export const useHabitStore = create((set, get) => ({
  habits: [],
  presets: [],
  isLoading: false,
  error: null,
  lastFetchDate: null,

  // Helper function to make authenticated requests with auto refresh
  makeRequest: async (url, options = {}) => {
    return await useAuthStore.getState().makeAuthenticatedRequest(url, options);
  },

  checkAndResetDaily: () => {
    const now = new Date();
    const today = now.toDateString();
    const lastFetch = get().lastFetchDate;
    
    if (lastFetch && lastFetch !== today) {
      console.log('New day detected, clearing habits cache');
      set({ habits: [], lastFetchDate: today });
      return true; 
    } else if (!lastFetch) {
      set({ lastFetchDate: today });
    }
    return false;
  },

  fetchPresets: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await get().makeRequest('https://habits-mobile-app.onrender.com/api/habits/presets', {
        method: 'GET'
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
      
      const isNewDay = get().checkAndResetDaily();
      set({ isLoading: true, error: null });
      
      const response = await get().makeRequest('https://habits-mobile-app.onrender.com/api/habits/dashboard', {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const cleanHabits = data.data.habits || [];
        set({ 
          habits: cleanHabits, 
          isLoading: false 
        });
        
        if (isNewDay) {
          console.log('Habits refreshed for new day');
        }
        
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
      
      console.log('Creating habit with data:', habitData);
      
      const response = await get().makeRequest('https://habits-mobile-app.onrender.com/api/habits/add', {
        method: 'POST',
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
      const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}/increment`, {
        method: 'POST'
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

  updateHabit: async (habitId, updateData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        await get().fetchHabits();
        set({ isLoading: false });
        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('UpdateHabit error:', error);
      set({ error: 'Network error', isLoading: false });
      return { success: false, message: `Network error: ${error.message}` };
    }
  },

  clearStore: () => {
    set({
      habits: [],
      presets: [],
      isLoading: false,
      error: null,
      lastFetchDate: null
    });
  }
}));
