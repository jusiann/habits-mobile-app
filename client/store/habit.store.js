import {create} from "zustand";
import {useAuthStore} from "./auth.store";
import {API_ENDPOINTS} from "../constants/api.config";
import { handleParseError, handleApiError, handleGenericError } from "../utils/error.utils";

export const useHabitStore = create((set, get) => ({
  habits: [],
  presets: [],
  isLoading: false,
  error: null,
  lastFetchDate: null,
  monthlyCache: {},

  // MAKE AUTHENTICATED REQUEST
  makeRequest: async (url, options = {}) => {
    try {
      return await useAuthStore.getState().makeAuthenticatedRequest(url, options);
    } catch (error) {
      throw new Error(error.message || "Authentication request failed");
    }
  },
  
  // CHECK AND RESET DAILY (UTC based version - commented out)
  /*
  checkAndResetDailyUTC: () => {
    try {
      const now = new Date();
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), norw.getUTCDate())).getTime();
      const lastFetch = get().lastFetchDate ? new Date(get().lastFetchDate).getTime() : null;
      
      if (lastFetch && lastFetch < todayUTC) {
        set({ 
          habits: [], 
          lastFetchDate: now.toISOString() 
        });
        return true; 
      } else if (!lastFetch) {
        set({ 
          lastFetchDate: now.toISOString() 
        });
      }
      return false;
    } catch (error) {
      handleGenericError("HabitStore.checkAndResetDailyUTC", error, false);
      return false;
    }
  },
  */

  // CHECK AND RESET DAILY (Local time based version - active)
  checkAndResetDaily: () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const lastFetch = get().lastFetchDate ? new Date(get().lastFetchDate).getTime() : null;
      
      if (lastFetch && lastFetch < today) {
        set({ 
          habits: [], 
          lastFetchDate: now.toISOString() 
        });
        return true;
      } else if (!lastFetch) {
        set({ 
          lastFetchDate: now.toISOString() 
        });
      }
      return false;
    } catch (error) {
      handleGenericError("HabitStore.checkAndResetDaily", error, false);
      return false;
    }
  },

  // FETCH PRESETS
  fetchPresets: async () => {
    set({ 
      isLoading: true, 
      error: null 
    });
    try {
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.PRESETS, {
        method: 'GET'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        handleParseError("HabitStore.fetchPresets", parseError, false);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
        const cleanPresets = data.data.presets.health || [];
        
        // UPDATE STATE WITH PRESETS
        set({ 
          presets: cleanPresets, 
          isLoading: false 
        });
        return { 
          success: true,
          data: cleanPresets
        };
      } else {
        throw new Error(data.message || data.error || "Failed to fetch presets");
      }
    } catch (error) {
      set({ 
        error: error.message || 'Network error', 
        isLoading: false 
      });
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    } finally {
      set({ 
        isLoading: false 
      });
    }
  },

  // FETCH HABITS
  fetchHabits: async () => {
    set({ 
      isLoading: true, 
      error: null 
    });
    try {
      // CHECK FOR NEW DAY
      const isNewDay = get().checkAndResetDaily();
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.DASHBOARD, {
        method: 'GET'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
          handleParseError("HabitStore.fetchHabits", parseError, false);
          throw new Error("Invalid server response format");
        }

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
        
        return { 
          success: true, 
          data: data.data 
        };
      } else {
        throw new Error(data.message || data.error || "Failed to fetch habits");
      }
    } catch (error) {
      set({ 
        error: error.message || 'Network error', 
        isLoading: false 
      });
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    } finally {
      set({ 
        isLoading: false 
      });
    }
  },

  // CREATE HABIT
  createHabit: async (habitData) => {
    set({ 
      isLoading: true, 
      error: null 
    });
    try {
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.ADD, {
        method: 'POST',
        body: JSON.stringify(habitData)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
          handleParseError("HabitStore.createHabit", parseError, false);
          throw new Error("Invalid server response format");
        }

      if (response.ok) {
        // REFRESH HABITS LIST
        await get().fetchHabits();
        return { 
          success: true, 
          data: data.data 
        };
      } else {
        throw new Error(data.message || data.error || "Failed to create habit");
      }
    } catch (error) {
      set({ 
        error: error.message || 'Network error', 
        isLoading: false 
      });
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    } finally {
      set({ 
        isLoading: false 
      });
    }
  },

  // INCREMENT HABIT
  incrementHabit: async (habitId) => {
    set({ 
      isLoading: true, 
      error: null 
    });
    try {
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.INCREMENT(habitId), {
        method: 'POST'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
          handleParseError("HabitStore.incrementHabit", parseError, false);
          throw new Error("Invalid server response format");
        }

      if (response.ok) {
        // REFRESH HABITS LIST
        await get().fetchHabits();
        return { 
          success: true, 
          data: data.data 
        };
      } else {
        throw new Error(data.message || data.error || "Failed to increment habit");
      }
    } catch (error) {
      set({ 
        error: error.message || 'Network error', 
        isLoading: false 
      });
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    } finally {
      set({ 
        isLoading: false 
      });
    }
  },

  // UPDATE HABIT
  updateHabit: async (habitId, updateData) => {
    set({ 
      isLoading: true, 
      error: null 
    });
    try {
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.DETAIL(habitId), {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
          handleParseError("HabitStore.updateHabit", parseError, false);
          throw new Error("Invalid server response format");
        }

      if (response.ok) {
        // REFRESH HABITS LIST
        await get().fetchHabits();
        return { 
          success: true, 
          data: data.data 
        };
      } else {
        throw new Error(data.message || data.error || "Failed to update habit");
      }
    } catch (error) {
      set({ 
        error: error.message || 'Network error', 
        isLoading: false 
      });
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    } finally {
      set({ 
        isLoading: false 
      });
    }
  },

  // FETCH HABIT LOGS BY DATE
  habitLogsByDate: async (date) => {
    // IF TODAY, RETURN FROM CACHE
    const isSameDay = (date1, date2) => {
      return date1.toDateString() === date2.toDateString();
    };
    set({ 
      isLoading: true, 
      error: null 
    });
  
    const requestDate = new Date(date);
    const today = new Date();
    const cacheKey = `${requestDate.getFullYear()}-${requestDate.getMonth()}`;
  
    if (!isSameDay(requestDate, today) && get().monthlyCache[cacheKey]?.[requestDate.getDate()]) {
      set({ 
        isLoading: false 
      });
      return get().monthlyCache[cacheKey][requestDate.getDate()];
    }
  
    try {
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.LOGS_BY_DATE(date), {
        method: 'GET'
      });
  
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
          handleParseError("HabitStore.habitProgress", parseError, false);
          throw new Error("Invalid server response format");
        }

      console.log(`API Response for date ${date}:`, data);

      if (response.ok) {
        const activeHabits = data.data.habits.filter(habit => 
          habit.status !== 'never_started' && 
          new Date(habit.createdAt).toDateString() <= new Date(date).toDateString()
        );
  
        const summary = data.data.summary;
        const completedHabits = summary.completedHabits;
        const inProgressHabits = summary.inProgressHabits;
        const totalActiveHabits = completedHabits + inProgressHabits;
        const completionRate = totalActiveHabits > 0 ? (completedHabits / totalActiveHabits) : 0;
  
        const result = { 
          success: true, 
          data: {
            summary: {
              ...summary,
              completionRate
            },
            habits: activeHabits
          }
        };
  
        // IF NOT TODAY, CACHE THE RESULT
        if (!isSameDay(requestDate, today)) {
          const currentCache = { ...get().monthlyCache };
          if (!currentCache[cacheKey]) {
            currentCache[cacheKey] = {};
          }
          currentCache[cacheKey][requestDate.getDate()] = result;
          set({ monthlyCache: currentCache });
        }
  
        return result;
      } else {
        throw new Error(data.message || data.error || "Failed to fetch habit logs");
      }
    } catch (error) {
        handleApiError(`HabitStore.habitLogsByDate.${date}`, error, false);
      set({ 
        error: error.message || 'Network error', 
        isLoading: false 
      });
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    } finally {
      set({ 
        isLoading: false 
      });
    }
  },

  // FETCH HABIT PROGRESS
  habitProgress: async (habitId, params = {}) => {
    set({ 
      isLoading: true, 
      error: null 
    });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = API_ENDPOINTS.HABITS.PROGRESS(habitId, queryParams);
      
      const response = await get().makeRequest(url, {
        method: 'GET'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
          handleParseError("HabitStore.deleteHabit", parseError, false);
          throw new Error("Invalid server response format");
        }

      if (response.ok) {
        const processedProgress = {
          ...data.data,
          dailyStats: data.data.dailyProgress?.map(day => ({
            ...day,
            formattedDate: new Date(day.date).toLocaleDateString(),
            completionRate: (day.progress / day.target) * 100
          })) || [],
          weeklyStats: {
            totalProgress: data.data.weeklyProgress?.reduce((sum, day) => sum + day.progress, 0) || 0,
            averageCompletion: data.data.weeklyProgress?.reduce((sum, day) => sum + ((day.progress / day.target) * 100), 0) / 7 || 0
          }
        };

        return { 
          success: true, 
          data: processedProgress
        };
      } else {
        throw new Error(data.message || data.error || "Failed to fetch habit progress");
      }
    } catch (error) {
      set({ 
        error: error.message || 'Network error', 
        isLoading: false 
      });
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    } finally {
      set({ 
        isLoading: false 
      });
    }
  },

  // DELETE HABIT
  deleteHabit: async (habitId) => {
    set({ 
      isLoading: true, 
      error: null 
    });
    try {
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.DELETE(habitId), {
        method: 'DELETE'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
        // REFRESH HABITS LIST
        await get().fetchHabits();
        return { 
          success: true, 
          data: data.data 
        };
      } else {
        throw new Error(data.message || data.error || "Failed to delete habit");
      }
    } catch (error) {
      set({ 
        error: error.message || 'Network error', 
        isLoading: false 
      });
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.' 
      };
    } finally {
      set({ 
        isLoading: false 
      });
    }
  },

  // CLEAR STORE
  clearStore: () => {
    set({
      monthlyCache: {},
      habits: [],
      presets: [],
      isLoading: false,
      error: null,
      lastFetchDate: null
    });
  }
}));
