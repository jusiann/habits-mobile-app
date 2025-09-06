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
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.PRESETS, {
        method: 'GET'
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error("JSON parse error:", error);
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
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.DASHBOARD, {
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
      } catch (error) {
        console.error("JSON parse error:", error);
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
      const {useAuthStore} = await import("./auth.store");
      const {user} = useAuthStore.getState();
      const timezone = user?.timezone || 'Europe/Istanbul';

      const pad = (n) => String(n).padStart(2, '0');
      const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const nowInTZ = getTodayInUserTZ(timezone);
      const prevDayInTZ = new Date(nowInTZ.getTime() - 24 * 60 * 60 * 1000);
      const now = new Date();
      const utcDateObj = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      const candidates = [{ 
        dateObj: nowInTZ, timeIso: nowInTZ.toISOString() }, { 
        dateObj: prevDayInTZ, timeIso: new Date(prevDayInTZ.getTime()).toISOString() }, { 
        dateObj: utcDateObj, timeIso: new Date().toISOString() }];

      for (const candidate of candidates) {
        const localDate = formatDate(candidate.dateObj);
        const localIso = candidate.timeIso;

        try {
          const response = await get().makeRequest(`${API_ENDPOINTS.HABITS.INCREMENT(habitId)}?localDate=${localDate}`, {
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
            new Error("Invalid server response format");
            continue;
          }

          if (response.ok) {
            await get().fetchHabits();
            return {
              success: true,
              data: data.data
            };
          } else {
            new Error(data.message || data.error || `Failed to increment habit (date ${localDate})`);
            continue;
          }
        } catch (err) {
          console.warn(`Increment attempt failed for date ${formatDate(candidate.dateObj)}:`, err?.message || err);
          continue;
        }
      }

      return { 
        success: false, 
        message: 'All increment attempts failed' 
      };
    } catch (error) {
      set({
        error: error.message || 'Network error',
        isLoading: false
      });
      return { 
        success: false, message: error.message || 'Network error. Please try again.' };
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
      const response = await get().makeRequest(API_ENDPOINTS.HABITS.UPDATE(habitId), {
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
    set({ 
      isLoading: true, 
      error: null 
    });

    try {
      const {useAuthStore} = await import('./auth.store');
      const {user} = useAuthStore.getState();
      const timezone = user?.timezone || 'Europe/Istanbul';

      const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
      const dateToLocalYYYYMMDD = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

      let localDateStr;
      let requestDate;

      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        localDateStr = date;
        requestDate = new Date(`${localDateStr}T00:00:00`);
      } else {
        const requestDateRaw = new Date(date);
        localDateStr = dateToLocalYYYYMMDD(requestDateRaw, timezone);
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

      const url = API_ENDPOINTS.HABITS.LOGS_BY_DATE(localDateStr);
      const response = await get().makeRequest(url, { method: 'GET' });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
        const activeHabits = (data.data.habits || []).filter(habit => {
          if (habit.status === 'never_started') return false;
          const createdAt = new Date(habit.createdAt).getTime();
          return createdAt <= endOfLocalDay.getTime();
        });

        const summary = data.data.summary || {};
        const result = { success: true, data: { summary: { ...summary }, habits: activeHabits } };

        if (!isSameDay(requestDate, today)) {
          const currentCache = { ...get().monthlyCache };
          if (!currentCache[cacheKey]) currentCache[cacheKey] = {};
          currentCache[cacheKey][requestDate.getDate()] = result;
          set({ monthlyCache: currentCache });
        }

        return result;
      }
    } catch (error) {
      console.error('[habitLogsByDate] Error:', error);
    }

    // IF SERVER RETURNED TARGETDATE ERROR
    //   try {
    //     const serverMessage = (data && data.message) || '';
    //     if (response.status === 500 && serverMessage.toLowerCase().includes('targetdate')) {
    //       const isoDate = new Date(`${localDateStr}T00:00:00Z`).toISOString();
    //       const fallbackUrl = API_ENDPOINTS.HABITS.LOGS_BY_DATE(encodeURIComponent(isoDate));
    //       const fallbackResp = await get().makeRequest(fallbackUrl, { method: 'GET' });
    //       let fallbackData;
    //       try { fallbackData = await fallbackResp.json(); } catch (parseError) {
    //         console.error('[habitLogsByDate] JSON parse error on fallback:', parseError);
    //         throw new Error('Invalid server response format (fallback)');
    //       }

    //       if (fallbackResp.ok) {
    //         const activeHabits = (fallbackData.data.habits || []).filter(habit => {
    //           if (habit.status === 'never_started') return false;
    //           const createdAt = new Date(habit.createdAt).getTime();
    //           return createdAt <= endOfLocalDay.getTime();
    //         });

    //         const summary = fallbackData.data.summary || {};
    //         const fallbackResult = { success: true, data: { summary: { ...summary }, habits: activeHabits } };

    //         if (!isSameDay(requestDate, today)) {
    //           const currentCache = { ...get().monthlyCache };
    //           if (!currentCache[cacheKey]) currentCache[cacheKey] = {};
    //           currentCache[cacheKey][requestDate.getDate()] = fallbackResult;
    //           set({ monthlyCache: currentCache });
    //         }

    //         return fallbackResult;
    //       }
    //     }
    //   } catch (retryError) {
    //     console.warn('[habitLogsByDate] fallback attempt failed:', retryError?.message || retryError);
    //   }

    //   return { success: false, message: data?.message || data?.error || 'Failed to fetch habit logs' };
    // } catch (error) {
    //   set({ error: error.message || 'Network error' });
    //   return { success: false, message: error.message || 'Network error. Please try again.' };
    // } finally {
    //   set({ isLoading: false });
    // }
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
      const url = API_ENDPOINTS.HABITS.PROGRESS(habitId, queryParams);
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
      const lastFetch = get().lastFetchDate ? new Date(get().lastFetchDate) : null;
      
      if (!lastFetch) {
        set({ 
          habits: [],
          lastFetchDate: now.toISOString() 
        });
        return true;
      } else if (isNewDayInUserTZ(lastFetch, timezone)) {
        set({ 
          habits: [], 
          lastFetchDate: now.toISOString() 
        });
        return true;
      } else {
      }
      return false;
    } catch (_error) {
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
  },

  // LOAD MONTH DATA (Optimized with cache)
  loadMonthData: async (date) => {
    set({ 
      isLoading: true, 
      error: null 
    });

    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const cacheKey = `${year}-${month}`;
      const newMonthData = {};
      const today = new Date();
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

      let totalDaysWithData = 0;
      let totalCompletionRateSum = 0;
      let totalCompletedHabits = 0;
      let currentStreakCount = 0;
      let streakBroken = false;

      let cachedDays = 0;
      let apiDays = 0;

      const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

      // LOAD ALL DAYS IN THIS MONTH
      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const cacheEntry = get().monthlyCache[cacheKey]?.[day];

        let result;
        const isToday = isSameDay(dateObj, today);
        if (cacheEntry && !isToday) {
          // Use cache (except for today)
          result = cacheEntry;
          cachedDays++;
          console.log(`[LoadMonthData] Day ${day}: Loaded from cache`);
        } else {
          // Load from API (always for today, or if no cache)
          console.log(`[LoadMonthData] Day ${day}: Loading from API...`);
          result = await get().habitLogsByDate(dateObj);
          apiDays++;
          console.log(`[LoadMonthData] Day ${day}: Loaded from API`);
        }

        if (result.success && result.data) {
          newMonthData[day] = {
            summary: result.data.summary
          };
          
          const summary = result.data.summary;
          
          // ONLY COUNT DAYS WITH HABIT DATA
          if (summary.completionRate > 0) {
            totalDaysWithData++;
            
            // USE BACKEND COMPLETION RATE DIRECTLY
            const dailyCompletionRate = summary.completionRate;
            totalCompletionRateSum += dailyCompletionRate;
            totalCompletedHabits += summary.completedHabits;
            
            // CALC CURRENT STREAK
            if (summary.completedHabits > 0) {
              if (!streakBroken) {
                currentStreakCount++;
              } else {
                currentStreakCount = 1;
                streakBroken = false;
              }
            } else {
              streakBroken = true;
            }
          } 
        }
      }

      const stats = {
        currentStreak: currentStreakCount,
        completionRate: daysInMonth > 0 ? Math.round(totalCompletionRateSum / daysInMonth) : 0,
        totalCompletedDays: totalDaysWithData,
        totalCompleted: totalCompletedHabits
      };

      return { 
        success: true, 
        data: { 
          monthData: newMonthData, 
          stats,
          cachedDays,
          apiDays
        } 
      };
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
  }
}));