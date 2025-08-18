import { create } from "zustand";

export const useHabitStore = create((set, get) => ({
  habits: [],
  presets: [],
  isLoading: false,
  error: null,

  // Presets'i backend'den al
  fetchPresets: async (token) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('https://habits-mobile-app.onrender.com/api/habits/presets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        set({ 
          presets: data.data.presets.health || [], 
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

  // Dashboard habits'i al
  fetchHabits: async (token) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('https://habits-mobile-app.onrender.com/api/habits/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        set({ 
          habits: data.data.habits || [], 
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

  // Yeni habit oluştur
  createHabit: async (habitData, token) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('https://habits-mobile-app.onrender.com/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(habitData)
      });

      const data = await response.json();

      if (response.ok) {
        // Başarılı olursa habits listesini yenile
        await get().fetchHabits(token);
        set({ isLoading: false });
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

  // Habit increment
  incrementHabit: async (habitId, token) => {
    try {
      const response = await fetch(`https://habits-mobile-app.onrender.com/api/habits/${habitId}/increment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Başarılı olursa habits listesini yenile
        await get().fetchHabits(token);
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (_error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Store'u temizle
  clearStore: () => {
    set({
      habits: [],
      presets: [],
      isLoading: false,
      error: null
    });
  }
}));
