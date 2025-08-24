import { create } from "zustand";
import { useAuthStore } from "./auth.store";

export const useHabitStore = create((set, get) => ({
  habits: [],
  presets: [],
  isLoading: false,
  error: null,
  lastFetchDate: null,

  // MAKE AUTHENTICATED REQUEST
  makeRequest: async (url, options = {}) => {
    return await useAuthStore.getState().makeAuthenticatedRequest(url, options);
  },

  // CHECK AND RESET DAILY
  checkAndResetDaily: () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastFetch = get().lastFetchDate ? new Date(get().lastFetchDate).getTime() : null;
    
    if (lastFetch && lastFetch < today) {
      console.log('New day detected, clearing habits cache');
      // CLEAR HABITS FOR NEW DAY
      set({ habits: [], lastFetchDate: now.toISOString() });
      return true; 
    } else if (!lastFetch) {
      // SET INITIAL DATE
      set({ lastFetchDate: now.toISOString() });
    }
    return false;
  },

  // FETCH PRESETS
  fetchPresets: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await get().makeRequest('https://habits-mobile-app.onrender.com/api/habits/presets', {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const cleanPresets = data.data.presets.health || [];
        
        // UPDATE STATE WITH PRESETS
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

  // FETCH HABITS
  fetchHabits: async () => {
    try {
      // CHECK FOR NEW DAY
      const isNewDay = get().checkAndResetDaily();
      set({ isLoading: true, error: null });
      
      const response = await get().makeRequest('https://habits-mobile-app.onrender.com/api/habits/dashboard', {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok) {
        const cleanHabits = data.data.habits || [];
        // UPDATE STATE WITH HABITS
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

  // CREATE HABIT
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
        // REFRESH HABITS LIST
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

  // INCREMENT HABIT
  incrementHabit: async (habitId) => {
    try {
      const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}/increment`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        // REFRESH HABITS LIST
        await get().fetchHabits();
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (_error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // UPDATE HABIT
  updateHabit: async (habitId, updateData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        // REFRESH HABITS LIST
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

  // CLEAR STORE
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
