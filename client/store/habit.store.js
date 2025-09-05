import {create} from "zustand";
import {makeAuthenticatedRequest, API_ENDPOINTS} from "../constants/api.utils";
import { getTodayInUserTZ, isNewDayInUserTZ } from "../constants/timezone.utils";

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
      const isNewDay = await get().checkAndResetDaily();
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

    const pad = (n) => String(n).padStart(2, '0');
    const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    try {
      const { useAuthStore } = await import("./auth.store");
      const { user } = useAuthStore.getState();
      const timezone = user?.timezone || 'Europe/Istanbul';

      // now in user's TZ
      const nowInTZ = getTodayInUserTZ(timezone); // expects Date

      // build three candidate dates to try:
      // 1) user's TZ date (current)
      // 2) previous day in user's TZ (covers server-side day-offset cases)
      // 3) UTC date (if backend is using UTC day)
      const prevDayInTZ = new Date(nowInTZ.getTime() - 24 * 60 * 60 * 1000);
      const now = new Date();
      const utcDateObj = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      const candidates = [
        { dateObj: nowInTZ, timeIso: nowInTZ.toISOString() },
        { dateObj: prevDayInTZ, timeIso: new Date(prevDayInTZ.getTime()).toISOString() },
        { dateObj: utcDateObj, timeIso: new Date().toISOString() } // use actual current ISO for UTC attempt
      ];

      let lastError = null;
      for (const candidate of candidates) {
        const localDate = formatDate(candidate.dateObj);
        const localIso = candidate.timeIso;

        try {
          const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}/increment?localDate=${localDate}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              localTime: localIso,
              timezone
            })
          });

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            console.error("JSON parse error on increment attempt:", parseError);
            // try next candidate
            lastError = new Error("Invalid server response format");
            continue;
          }

          if (response.ok) {
            await get().fetchHabits();
            return {
              success: true,
              data: data.data
            };
          } else {
            // record and try next candidate
            lastError = new Error(data.message || data.error || `Failed to increment habit (date ${localDate})`);
            continue;
          }
        } catch (err) {
          // network / auth error -> try next candidate
          console.warn(`Increment attempt failed for date ${formatDate(candidate.dateObj)}:`, err.message || err);
          lastError = err;
          continue;
        }
      }

      // all attempts failed
      throw lastError || new Error("Failed to increment habit after retries");
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
  // incrementHabit: async (habitId) => {
  //   set({ 
  //     isLoading: true, 
  //     error: null 
  //   });
  //   try {
  //     // get user's timezone
  //     const { useAuthStore } = await import("./auth.store");
  //     const { user } = useAuthStore.getState();
  //     const timezone = user?.timezone || 'Europe/Istanbul';

  //     // get current time in user's TZ (ISO) and a YYYY-MM-DD local date fallback
  //     const nowInTZ = getTodayInUserTZ(timezone); // expects Date
  //     const localIso = nowInTZ.toISOString();
  //     const localDate = `${nowInTZ.getFullYear()}-${String(nowInTZ.getMonth()+1).padStart(2,'0')}-${String(nowInTZ.getDate()).padStart(2,'0')}`;

  //     const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/${habitId}/increment?localDate=${localDate}`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         localTime: localIso,
  //         timezone
  //       })
  //     });

  //     let data;
  //     try {
  //       data = await response.json();
  //     } catch (parseError) {
  //       console.error("JSON parse error:", parseError);
  //       throw new Error("Invalid server response format");
  //     }

  //     if (response.ok) {
  //       await get().fetchHabits();
  //       return { 
  //         success: true, 
  //         data: data.data 
  //       };
  //     } else {
  //       throw new Error(data.message || data.error || "Failed to increment habit");
  //     }
  //   } catch (error) {
  //     set({ 
  //       error: error.message || 'Network error', 
  //       isLoading: false 
  //     });
  //     return { 
  //       success: false, 
  //       message: error.message || 'Network error. Please try again.' 
  //     };
  //   } finally {
  //     set({ 
  //       isLoading: false 
  //     });
  //   }
  // },


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

  habitLogsByDate: async (date) => {
    // IF TODAY, RETURN FROM CACHE
    const isSameDay = (date1, date2) => {
      return date1.toDateString() === date2.toDateString();
    };
    set({ 
      isLoading: true, 
      error: null 
    });

      // normalize incoming date and make it timezone-aware (user's TZ)
    try {
      const { useAuthStore } = await import("./auth.store");
      const { user } = useAuthStore.getState();
      const timezone = user?.timezone || 'Europe/Istanbul';

      // helper: get YYYY-MM-DD string for a Date in user's TZ
      const dateToLocalYYYYMMDD = (d, tz) => {
        return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
      };

      let localDateStr;
      let requestDate;

      // if caller passed a plain YYYY-MM-DD string, use it directly (avoid parsing inconsistencies)
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        localDateStr = date;
        requestDate = new Date(`${localDateStr}T00:00:00`);
      } else {
        // parse incoming `date` param into a Date object and format for user's tz
        const requestDateRaw = new Date(date);
        localDateStr = dateToLocalYYYYMMDD(requestDateRaw, timezone);
        // build start/end of that day in client's local JS time (for comparisons/caching)
        requestDate = new Date(`${localDateStr}T00:00:00`);
      }
      const startOfLocalDay = new Date(requestDate);
      const endOfLocalDay = new Date(startOfLocalDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      const today = new Date();
      const cacheKey = `${requestDate.getFullYear()}-${requestDate.getMonth()}`;

      if (!isSameDay(requestDate, today) && get().monthlyCache[cacheKey]?.[requestDate.getDate()]) {
        set({ 
          isLoading: false 
        });
        return get().monthlyCache[cacheKey][requestDate.getDate()];
      }

  // call API using the user's localDate (YYYY-MM-DD) so server gets user's-day intent
  // prefer centralized endpoint helper so base URL is consistent with other calls
  const url = API_ENDPOINTS.HABITS.LOGS_BY_DATE(localDateStr);
  console.debug('[habitLogsByDate] requesting URL:', url);
  const response = await get().makeRequest(url, { method: 'GET' });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

  // If server returned OK, handle as before
  if (response.ok) {
        // keep only habits that existed on that local day (compare createdAt <= endOfLocalDay)
        const activeHabits = data.data.habits.filter(habit => {
          if (habit.status === 'never_started') return false;
          const createdAt = new Date(habit.createdAt).getTime();
          return createdAt <= endOfLocalDay.getTime();
        });

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

  // IF NOT TODAY, CACHE THE RESULT (cache key uses user's local day)
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
  // helpful debug info for server-side errors seen in production
  console.debug('[habitLogsByDate] response not ok:', response.status, data);

  // Retry with ISO datetime if server indicates missing/undefined 'targetDate' (server bug on some deployments)
  try {
    const serverMessage = (data && data.message) || '';
    if (response.status === 500 && serverMessage.toLowerCase().includes('targetdate')) {
      const isoDate = new Date(`${localDateStr}T00:00:00Z`).toISOString();
      const fallbackUrl = API_ENDPOINTS.HABITS.LOGS_BY_DATE(encodeURIComponent(isoDate));
      console.debug('[habitLogsByDate] detected targetDate error, retrying with ISO date:', isoDate, fallbackUrl);
      const fallbackResp = await get().makeRequest(fallbackUrl, { method: 'GET' });
      let fallbackData;
      try {
        fallbackData = await fallbackResp.json();
      } catch (parseError) {
        console.error('[habitLogsByDate] JSON parse error on fallback:', parseError);
        throw new Error('Invalid server response format (fallback)');
      }

      if (fallbackResp.ok) {
        const activeHabits = fallbackData.data.habits.filter(habit => {
          if (habit.status === 'never_started') return false;
          const createdAt = new Date(habit.createdAt).getTime();
          return createdAt <= endOfLocalDay.getTime();
        });

        const summary = fallbackData.data.summary;
        const fallbackResult = {
          success: true,
          data: {
            summary: { ...summary },
            habits: activeHabits
          }
        };

        // cache fallback result if not today
        if (!isSameDay(requestDate, today)) {
          const currentCache = { ...get().monthlyCache };
          if (!currentCache[cacheKey]) currentCache[cacheKey] = {};
          currentCache[cacheKey][requestDate.getDate()] = fallbackResult;
          set({ monthlyCache: currentCache });
        }

        return fallbackResult;
      }
    }
  } catch (retryError) {
    console.warn('[habitLogsByDate] fallback attempt failed:', retryError?.message || retryError);
  }

  // final: return structured error for UI to display/log
  return {
    success: false,
    message: data.message || data.error || "Failed to fetch habit logs"
  };
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
  // habitLogsByDate: async (date) => {
  //   // IF TODAY, RETURN FROM CACHE
  //   const isSameDay = (date1, date2) => {
  //     return date1.toDateString() === date2.toDateString();
  //   };
  //   set({ 
  //     isLoading: true, 
  //     error: null 
  //   });
  
  //   const requestDate = new Date(date);
  //   const today = new Date();
  //   const cacheKey = `${requestDate.getFullYear()}-${requestDate.getMonth()}`;
  
  //   if (!isSameDay(requestDate, today) && get().monthlyCache[cacheKey]?.[requestDate.getDate()]) {
  //     set({ 
  //       isLoading: false 
  //     });
  //     return get().monthlyCache[cacheKey][requestDate.getDate()];
  //   }
  
  //   try {
  //     const response = await get().makeRequest(`https://habits-mobile-app.onrender.com/api/habits/logs-by-date?date=${date}`, {
  //       method: 'GET'
  //     });
  
  //     let data;
  //     try {
  //       data = await response.json();
  //     } catch (parseError) {
  //       console.error("JSON parse error:", parseError);
  //       throw new Error("Invalid server response format");
  //     }

  //     // REMOVE IT
  //     console.log(`API Response for date ${date}`);

  //     if (response.ok) {
  //       const activeHabits = data.data.habits.filter(habit => 
  //         habit.status !== 'never_started' && 
  //         new Date(habit.createdAt).toDateString() <= new Date(date).toDateString()
  //       );
  
  //       const summary = data.data.summary;
  //       const result = { 
  //         success: true, 
  //         data: {
  //           summary: {
  //             ...summary
  //           },
  //           habits: activeHabits
  //         }
  //       };
  
  //       // IF NOT TODAY, CACHE THE RESULT
  //       if (!isSameDay(requestDate, today)) {
  //         const currentCache = { ...get().monthlyCache };
  //         if (!currentCache[cacheKey]) {
  //           currentCache[cacheKey] = {};
  //         }
  //         currentCache[cacheKey][requestDate.getDate()] = result;
  //         set({ monthlyCache: currentCache });
  //       }
  
  //       return result;
  //     } else {
  //       throw new Error(data.message || data.error || "Failed to fetch habit logs");
  //     }
  //   } catch (error) {
  //     set({ 
  //       error: error.message || 'Network error', 
  //       isLoading: false 
  //     });
  //     return { 
  //       success: false, 
  //       message: error.message || 'Network error. Please try again.' 
  //     };
  //   } finally {
  //     set({ 
  //       isLoading: false 
  //     });
  //   }
  // },

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
  checkAndResetDaily: async () => {
    try {
      const { useAuthStore } = await import("./auth.store");
      const { user } = useAuthStore.getState();
      const timezone = user?.timezone || 'Europe/Istanbul';
      
      const now = new Date();
      const todayInTZ = getTodayInUserTZ(timezone);
      const lastFetch = get().lastFetchDate ? new Date(get().lastFetchDate) : null;
      const currentHabits = get().habits || [];
      
      // DEBUG: HABIT RESET CHECK STARTED
      console.log('🕐 [HABIT RESET] Check started at:', now.toLocaleString('tr-TR'));
      console.log('📊 [HABIT RESET] Current habits count:', currentHabits.length);
      console.log('📅 [HABIT RESET] Today in TZ:', todayInTZ.toLocaleString('tr-TR'));
      console.log('📅 [HABIT RESET] Last fetch date:', lastFetch ? lastFetch.toLocaleString('tr-TR') : 'Never');
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
      } else if (isNewDayInUserTZ(lastFetch, timezone)) {
        // DEBUG: NEW DAY DETECTED
        console.log('🔄 [HABIT RESET] New day detected! Resetting habits...');
        console.log('🔄 [HABIT RESET] Reset Date & Time:', now.toLocaleString('tr-TR'));
        console.log('🔄 [HABIT RESET] Previous habits cleared:', currentHabits.length, 'habits');
        console.log('🔄 [HABIT RESET] Last fetch was:', lastFetch.toLocaleString('tr-TR'));
        console.log('🔄 [HABIT RESET] Today is:', todayInTZ.toLocaleString('tr-TR'));
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
        console.log('⏰ [HABIT RESET] Last fetch was:', lastFetch.toLocaleString('tr-TR'));
        console.log('⏰ [HABIT RESET] Today is:', todayInTZ.toLocaleString('tr-TR'));
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