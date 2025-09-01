import {create} from "zustand";
import {makeAuthenticatedRequest} from "../constants/api.utils";

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
      const {useAuthStore} = await import("./auth.store");
      return await makeAuthenticatedRequest(url, options, useAuthStore);
    } catch (error) {
      throw new Error(error.message || "Authentication request failed");
    }
  },
  
  // FETCH PRESETS
  fetchPresets: async () => {
    set({ 
      isLoading: true, 
      error: null 
    });
    try {
      const response = await get().makeRequest('https://habits-mobile-app.onrender.com/api/habits/presets', {
        method: 'GET'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
        const cleanPresets = data.data.presets.health || [];
        
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
      const isNewDay = get().checkAndResetDaily();
      const response = await get().makeRequest('https://habits-mobile-app.onrender.com/api/habits/dashboard', {
        method: 'GET'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
        const cleanHabits = data.data.habits || [];
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
      const response = await get().makeRequest('https://habits-mobile-app.onrender.com/api/habits/add', {
        method: 'POST',
        body: JSON.stringify(habitData)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
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
      const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}/increment`, {
        method: 'POST'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
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
      const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
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
      const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/logs-by-date?date=${date}`, {
        method: 'GET'
      });
  
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

      // REMOVE IT
      console.log(`API Response for date ${date}`);

      if (response.ok) {
        const activeHabits = data.data.habits.filter(habit => 
          habit.status !== 'never_started' && 
          new Date(habit.createdAt).toDateString() <= new Date(date).toDateString()
        );
  
        const summary = data.data.summary;
        const result = { 
          success: true, 
          data: {
            summary: {
              ...summary
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
      const url = `https://habits-mobile-app.onrender.com/api/habits/${habitId}/progress${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await get().makeRequest(url, {
        method: 'GET'
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
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
      const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}`, {
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
      console.error("Error in checkAndResetDailyUTC:", error);
      return false;
    }
  },
  */

  // CHECK AND RESET DAILY (Local time based version - DEACTIVATED)
  checkAndResetDaily: () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const lastFetch = get().lastFetchDate ? new Date(get().lastFetchDate).getTime() : null;
      const currentHabits = get().habits || [];
      
      // DEBUG: HABIT RESET CHECK STARTED
      console.log('🕐 [HABIT RESET] Check started at:', now.toLocaleString('tr-TR'));
      console.log('📊 [HABIT RESET] Current habits count:', currentHabits.length);
      console.log('📅 [HABIT RESET] Today timestamp:', today);
      console.log('📅 [HABIT RESET] Last fetch timestamp:', lastFetch);
      console.log('📅 [HABIT RESET] Last fetch date:', lastFetch ? new Date(lastFetch).toLocaleString('tr-TR') : 'Never');
      if (!lastFetch) {
        // DEBUG: FIRST SETUP
        console.log('🆕 [HABIT RESET] First time setup - initializing and resetting habits');
        console.log('🆕 [HABIT RESET] Setup Date & Time:', now.toLocaleString('tr-TR'));
        console.log('🆕 [HABIT RESET] Clearing any existing habits:', currentHabits.length, 'habits');
        set({ 
          habits: [],
          lastFetchDate: now.toISOString() 
        });
        // DEBUG: FIRST SETUP COMPLETED
        console.log('✅ [HABIT RESET] First time setup and reset completed');
        return true;
      } else if (lastFetch < today) {
        // DEBUG: NEW DAY DETECTED
        console.log('🔄 [HABIT RESET] New day detected! Resetting habits...');
        console.log('🔄 [HABIT RESET] Reset Date & Time:', now.toLocaleString('tr-TR'));
        console.log('🔄 [HABIT RESET] Previous habits cleared:', currentHabits.length, 'habits');
        console.log('🔄 [HABIT RESET] Last fetch was:', new Date(lastFetch).toLocaleString('tr-TR'));
        console.log('🔄 [HABIT RESET] Today is:', new Date(today).toLocaleString('tr-TR'));
        set({ 
          habits: [], 
          lastFetchDate: now.toISOString() 
        });
        // DEBUG: RESET COMPLETED
        console.log('✅ [HABIT RESET] Reset completed successfully');
        return true;
      } else {
        // DEBUG: SAME DAY DETECTED
        console.log('⏰ [HABIT RESET] Same day detected - no reset needed');
        console.log('⏰ [HABIT RESET] Current habits will be preserved:', currentHabits.length, 'habits');
        console.log('⏰ [HABIT RESET] Last fetch was:', new Date(lastFetch).toLocaleString('tr-TR'));
        console.log('⏰ [HABIT RESET] Today is:', new Date(today).toLocaleString('tr-TR'));
      }
      return false;
    } catch (error) {
      // DEBUG: ERROR OCCURRED
      console.error('❌ [HABIT RESET] Error in checkAndResetDaily:', error);
      console.error('❌ [HABIT RESET] Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toLocaleString('tr-TR')
      });
      return false;
    }
  },

  // CHECK AND RESET DAILY (FOR TURKEY UTC+3)
  // checkAndResetDaily: () => {
  //   try {
  //     const now = new Date();
  //     const currentHabits = get().habits || [];
  //     const nowTR = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  //     const todayTR = new Date(nowTR.getFullYear(), nowTR.getMonth(), nowTR.getDate()).getTime();
  //     const lastFetch = get().lastFetchDate ? new Date(get().lastFetchDate) : null;
  //     const lastFetchTR = lastFetch ? new Date(lastFetch.getTime() + 3 * 60 * 60 * 1000) : null;
  //     const lastFetchDayTR = lastFetchTR ? new Date(lastFetchTR.getFullYear(), lastFetchTR.getMonth(), lastFetchTR.getDate()).getTime() : null;
      
  //     // DEBUG: HABIT RESET CHECK STARTED
  //     console.log('🕐 [HABIT RESET] Check started at:', nowTR.toLocaleString('tr-TR'));
  //     console.log('📊 [HABIT RESET] Current habits count:', currentHabits.length);
  //     console.log('📅 [HABIT RESET] Today (TR) timestamp:', todayTR);
  //     console.log('📅 [HABIT RESET] Last fetch (TR) timestamp:', lastFetchDayTR);
  //     console.log('📅 [HABIT RESET] Last fetch (TR) date:', lastFetchDayTR ? new Date(lastFetchDayTR).toLocaleString('tr-TR') : 'Never');

  //     if (!lastFetchDayTR) {
  //       // DEBUG: FIRST SETUP
  //       console.log('🆕 [HABIT RESET] First time setup - initializing and resetting habits');
  //       console.log('🆕 [HABIT RESET] Setup Date & Time:', nowTR.toLocaleString('tr-TR'));
  //       console.log('🆕 [HABIT RESET] Clearing any existing habits:', currentHabits.length, 'habits');
  //       set({ 
  //         habits: [],
  //         lastFetchDate: now.toISOString() 
  //       });

  //       // DEBUG: FIRST SETUP COMPLETED
  //       console.log('✅ [HABIT RESET] First time setup and reset completed');
  //       return true;
  //     } else if (lastFetchDayTR < todayTR) {
  //       // DEBUG: NEW DAY DETECTED
  //       console.log('🔄 [HABIT RESET] New day detected! Resetting habits...');
  //       console.log('🔄 [HABIT RESET] Reset Date & Time:', nowTR.toLocaleString('tr-TR'));
  //       console.log('🔄 [HABIT RESET] Previous habits cleared:', currentHabits.length, 'habits');
  //       console.log('🔄 [HABIT RESET] Last fetch was:', lastFetchDayTR ? new Date(lastFetchDayTR).toLocaleString('tr-TR') : 'Never');
  //       console.log('🔄 [HABIT RESET] Today is:', new Date(todayTR).toLocaleString('tr-TR'));
  //       set({ 
  //         habits: [], 
  //         lastFetchDate: now.toISOString() 
  //       });
  //       // DEBUG: RESET COMPLETED
  //       console.log('✅ [HABIT RESET] Reset completed successfully');
  //       return true;
  //     } else {
  //       // DEBUG: SAME DAY DETECTED
  //       console.log('⏰ [HABIT RESET] Same day detected - no reset needed');
  //       console.log('⏰ [HABIT RESET] Current habits will be preserved:', currentHabits.length, 'habits');
  //       console.log('⏰ [HABIT RESET] Last fetch was:', lastFetchDayTR ? new Date(lastFetchDayTR).toLocaleString('tr-TR') : 'Never');
  //       console.log('⏰ [HABIT RESET] Today is:', new Date(todayTR).toLocaleString('tr-TR'));
  //     }
  //     return false;
  //   } catch (error) {
  //     // DEBUG: ERROR OCCURRED
  //     console.error('❌ [HABIT RESET] Error in checkAndResetDaily:', error);
  //     console.error('❌ [HABIT RESET] Error details:', {
  //       message: error.message,
  //       stack: error.stack,
  //       timestamp: new Date().toLocaleString('tr-TR')
  //     });
  //     return false;
  //   }
  // },

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
