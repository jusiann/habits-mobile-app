import {create} from "zustand";
import {makeAuthenticatedRequest, API_ENDPOINTS} from "../constants/api.utils";
import {getTodayInUserTZ, isNewDayInUserTZ} from "../constants/timezone.utils";
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage cache functions
const getCacheKey = (userId, date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return `habit_cache_${userId}_${year}_${month}_${day}`;
};

const getCachedDayData = async (userId, date) => {
    try {
        const key = getCacheKey(userId, date);
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
            const data = JSON.parse(cached);
            // Check if cache is still valid (1 hour for current day, 24 hours for past days)
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const maxAge = isToday ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 1 hour vs 24 hours
            
            if (now.getTime() - data.timestamp < maxAge) {
                return data.result;
            }
        }
        return null;
    } catch (error) {
        console.warn('Cache read error:', error);
        return null;
    }
};

const setCachedDayData = async (userId, date, result) => {
    try {
        const key = getCacheKey(userId, date);
        const data = {
            result,
            timestamp: new Date().getTime()
        };
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn('Cache write error:', error);
    }
};

const clearCacheForDay = async (userId, date) => {
    try {
        const key = getCacheKey(userId, date);
        await AsyncStorage.removeItem(key);
        console.log(`Cache cleared for ${date.toDateString()}`);
    } catch (error) {
        console.warn('Cache clear error:', error);
    }
};

const clearAllCache = async (userId) => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(key => key.startsWith(`habit_cache_${userId}_`));
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Cleared ${cacheKeys.length} cache entries for user ${userId}`);
    } catch (error) {
        console.warn('Cache clear all error:', error);
    }
};

export const useHabitStore = create((set, get) => ({
    habits: [],
    presets: [],
    goals: [],
    isLoading: false,
    error: null,
    lastFetchDate: null,
    monthlyCache: {},

    // API WRAPPER WITH AUTO REFRESH
    makeRequest: async (url, options = {}) => {
        try {
            const {useAuthStore} = await import("./auth.store");
            const authState = useAuthStore.getState();
            
            // CHECK IF USER IS AUTHENTICATED
            if (!authState.token || !authState.user) {
                console.warn('No authentication available, skipping API call to:', url);
                throw new Error("Not authenticated");
            }
            
            return await makeAuthenticatedRequest(url, options, useAuthStore);
        } catch (error) {
            console.error('makeRequest failed for:', url, error.message);
            
            // IF AUTHENTICATION ERROR, DON'T RETRY
            if (error.message.includes("Not authenticated") || 
                error.message.includes("Session expired") || 
                error.message.includes("No authentication token available")) {
                throw error; // RE-THROW WITHOUT RETRY
            }
            
            throw new Error(error.message || "Authentication request failed");
        }
    },
  
    // LOAD MONTH DATA WITH SMART CACHING
    loadMonthData: async (date) => {
        set({ 
            isLoading: true, 
            error: null 
        });

        try {
            const {useAuthStore} = await import('./auth.store');
            const {user, token} = useAuthStore.getState();
            
            console.log(`[LoadMonthData] Auth check - User:`, !!user, 'Token:', !!token, 'User ID:', user?._id);
            
            if (!user || !token || !user._id) {
                console.log(`[LoadMonthData] No authentication, returning error`);
                return {
                    success: false,
                    message: "User not authenticated"
                };
            }
            
            const year = date.getFullYear();
            const month = date.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const newMonthData = {};
            const today = new Date();
            const currentMonth = today.getFullYear() === year && today.getMonth() === month;

            let totalDaysWithData = 0;
            let totalCompletionRateSum = 0;
            let totalCompletedHabits = 0;
            let currentStreakCount = 0;

            let cachedDays = 0;
            let apiDays = 0;
            let skippedFutureDays = 0;

            console.log(`[LoadMonthData] Loading ${year}-${month + 1} (Current month: ${currentMonth})`);

            // MONTHLY API OPTIMIZATION - Use single request for past months
            const isCurrentMonth = currentMonth;
            const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());
            
            if (isPastMonth || !isCurrentMonth) {
                console.log(`[LoadMonthData] Using Monthly API for ${year}-${month + 1}`);
                try {
                    const response = await get().makeRequest(API_ENDPOINTS.HABITS.MONTHLY(year, month + 1), {
                        method: 'GET'
                    });

                    let data;
                    try {
                        data = await response.json();
                    } catch (parseError) {
                        console.error("Monthly API JSON parse error:", parseError);
                        throw new Error("Invalid server response format");
                    }

                    if (response.ok && data.success) {
                        console.log(`[LoadMonthData] Monthly API success: ${Object.keys(data.data).length} days loaded`);
                        set({ isLoading: false });
                        
                        // Monthly API'den stats gelmediği için default stats oluştur
                        const defaultStats = {
                            currentStreak: 0,
                            completionRate: 0,
                            totalCompleted: 0,
                            totalCompletedDays: 0
                        };
                        
                        return {
                            success: true,
                            data: {
                                monthData: data.data,
                                stats: defaultStats,
                                cachedDays: 0,
                                apiDays: 1, // Single monthly API call
                                skippedFutureDays: 0,
                                apiSource: 'monthly'
                            }
                         };
                    } else {
                        console.warn(`[LoadMonthData] Monthly API failed, falling back to individual calls`);
                    }
                } catch (error) {
                    console.warn(`[LoadMonthData] Monthly API error, falling back to individual calls:`, error.message);
                }
            }

            console.log(`[LoadMonthData] Using individual API calls for ${year}-${month + 1}`);

            // FALLBACK: Individual day loading for current month or when monthly API fails

            // LOAD ALL DAYS IN MONTH  
            console.log(`[LoadMonthData] Loading data for ${daysInMonth} days...`);
            console.log(`[LoadMonthData] Cache check will use user ID:`, user._id);
            
            // Get today's date for future day optimization
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(year, month, day);
                const dateObjOnly = new Date(year, month, day);
                let result;
                
                // FUTURE DAY OPTIMIZATION - Skip API calls for future days
                if (dateObjOnly > todayDateOnly) {
                    console.log(`[LoadMonthData] Day ${day}: Future day (${dateObj.toDateString()}), skipping API call`);
                    skippedFutureDays++;
                    result = {
                        success: true,
                        data: {
                            summary: {
                                totalHabits: 0,
                                completedHabits: 0,
                                inProgressHabits: 0, 
                                notStartedHabits: 0,
                                completionRate: 0
                            },
                            habits: []
                        }
                    };
                } else {
                    // Try to get from AsyncStorage cache first
                    result = await getCachedDayData(user._id, dateObj);
                    if (result) {
                        console.log(`[LoadMonthData] Day ${day}: Using cached data (${dateObj.toDateString()})`);
                        cachedDays++;
                    } else {
                        console.log(`[LoadMonthData] Day ${day}: Cache miss, loading from API (${dateObj.toDateString()})`);
                        result = await get().habitLogsByDate(dateObj);
                        
                        // Cache the result if successful
                        if (result && result.success) {
                            await setCachedDayData(user._id, dateObj, result);
                            console.log(`[LoadMonthData] Day ${day}: Result cached for future use`);
                        }
                        apiDays++;
                    }
                }

                if (result && result.success && result.data) {
                    newMonthData[day] = {
                        summary: result.data.summary
                    };
                    
                    const summary = result.data.summary;
                    if (summary.completionRate > 0) {
                        totalDaysWithData++;
                        totalCompletionRateSum += summary.completionRate;
                        totalCompletedHabits += summary.completedHabits;
                    }
                } else {
                    // No data for this day, create empty entry
                    newMonthData[day] = {
                        summary: {
                            totalHabits: 0,
                            completedHabits: 0,
                            inProgressHabits: 0,
                            notStartedHabits: 0,
                            completionRate: 0
                        }
                    };
                    console.log(`[LoadMonthData] Day ${day}: No data, created empty entry`);
                }
            }

            // CALCULATE CURRENT STREAK - COUNT BACKWARDS FROM TODAY
            console.log('[LoadMonthData] Calculating streak backwards from today...');
            const todayDate = new Date();
            let streakDate = new Date(todayDate);
            
            // Start from today and go backwards to calculate correct streak
            while (true) {
                const day = streakDate.getDate();
                const currentMonth = streakDate.getMonth();
                const currentYear = streakDate.getFullYear();
                
                // If we're looking at a different month, we need to load that data
                let dayData;
                if (currentYear === year && currentMonth === month) {
                    // Same month, use our loaded data
                    dayData = newMonthData[day];
                } else {
                    // Different month, check cache first, then API
                    const cached = await getCachedDayData(user._id, streakDate);
                    if (cached && cached.success && cached.data) {
                        dayData = { summary: cached.data.summary };
                    } else {
                        const result = await get().habitLogsByDate(streakDate);
                        if (result && result.success && result.data) {
                            dayData = { summary: result.data.summary };
                        }
                    }
                }
                
                if (dayData && dayData.summary && dayData.summary.completedHabits > 0) {
                    currentStreakCount++;
                    console.log(`[LoadMonthData] Streak day ${currentStreakCount}: ${streakDate.toDateString()} (${dayData.summary.completedHabits} completed)`);
                } else {
                    // No completed habits on this day or no data - streak ends here
                    console.log(`[LoadMonthData] Streak broken at: ${streakDate.toDateString()} (${dayData?.summary?.completedHabits || 0} completed)`);
                    break;
                }
                
                // Move to previous day
                streakDate.setDate(streakDate.getDate() - 1);
                
                // Safeguard: don't go back more than 365 days
                if (currentStreakCount >= 365) {
                    console.log('[LoadMonthData] Streak safeguard: stopping at 365 days');
                    break;
                }
            }

            console.log(`[LoadMonthData] Final streak calculated: ${currentStreakCount} days`);

            // CALCULATE TOTALS
            const stats = {
                currentStreak: currentStreakCount,
                completionRate: daysInMonth > 0 ? Math.round(totalCompletionRateSum / daysInMonth) : 0,
                totalCompletedDays: totalDaysWithData,
                totalCompleted: totalCompletedHabits
            };

            console.log('[LoadMonthData] Stats calculated:', {
                currentStreak: currentStreakCount,
                completionRate: daysInMonth > 0 ? Math.round(totalCompletionRateSum / daysInMonth) : 0,
                totalCompletedDays: totalDaysWithData,
                totalCompleted: totalCompletedHabits,
                daysInMonth,
                totalCompletionRateSum
            });

            console.log(`[LoadMonthData] Final monthData:`, newMonthData);
            console.log(`[LoadMonthData] Day 14 data:`, newMonthData[14]);
            console.log(`[LoadMonthData] Performance: ${skippedFutureDays} future days skipped, ${cachedDays} cached, ${apiDays} API calls`);
            
            return { 
                success: true, 
                data: { 
                    monthData: newMonthData, 
                    stats,
                    cachedDays,
                    apiDays,
                    skippedFutureDays
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
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
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
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
        }
    },

    // FETCH GOALS
    fetchGoals: async () => {
        set({ 
            isLoading: true, 
            error: null 
        });

        try {
            const response = await get().makeRequest(API_ENDPOINTS.HABITS.GOALS.LIST, { 
                method: 'GET' 
            });

            let data;
            try { 
                data = await response.json(); 
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid server response format');
            }

            if (response.ok) {
                const cleanGoals = data.data || [];
                set({ 
                    goals: cleanGoals, 
                    isLoading: false 
                });
                return { 
                    success: true, 
                    data: cleanGoals 
                };
            } else {
                throw new Error(data.message || data.error || 'Failed to fetch goals');
            }
        } catch (error) {
            set({ 
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
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
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
        }
    },

    // CREATE GOAL
    createGoal: async (goalData) => {
        set({ 
            isLoading: true, 
            error: null 
        });

        try {
            const response = await get().makeRequest(API_ENDPOINTS.HABITS.GOALS.CREATE, {
                method: 'POST',
                body: JSON.stringify(goalData)
            });

            let data;
            try { 
                data = await response.json(); 
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid server response format');
            }

            if (response.ok) {
                await get().fetchGoals();
                return { 
                    success: true, 
                    data: data.data 
                };
            } else {
                throw new Error(data.message || data.error || 'Failed to create goal');
            }
        } catch (error) {
            set({ 
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
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
                dateObj: nowInTZ, 
                timeIso: nowInTZ.toISOString() 
            }, { 
                dateObj: prevDayInTZ, 
                timeIso: new Date(prevDayInTZ.getTime()).toISOString() 
            }, { 
                dateObj: utcDateObj, 
                timeIso: new Date().toISOString() 
            }];

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
                        // Clear cache for the affected date since data has changed
                        const {useAuthStore} = await import("./auth.store");
                        const {user} = useAuthStore.getState();
                        if (user?._id) {
                            await clearCacheForDay(user._id, candidate.dateObj);
                        }
                        
                        await get().fetchHabits();
                        return {
                            success: true,
                            data: data.dataa
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
                error: error.message || 'An error occurred',
                isLoading: false
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
        }
    },

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
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
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
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
        }
    },

    // DELETE GOAL
    deleteGoal: async (goalId) => {
        set({ 
            isLoading: true, 
            error: null 
        });

        try {
            const response = await get().makeRequest(API_ENDPOINTS.HABITS.GOALS.DELETE(goalId), { 
                method: 'DELETE' 
            });

            let data;
            try { 
                data = await response.json(); 
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid server response format');
            }

            if (response.ok) {
                await get().fetchGoals();
                return { 
                    success: true, 
                    data: data.data 
                };
            } else {
                throw new Error(data.message || data.error || 'Failed to delete goal');
            }
        } catch (error) {
            set({ 
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
        }
    },

    // CHECK AND RESET DAILY
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
            }
            return false;
        } catch (_error) {
            return false;
        }
    },

    // HABIT LOGS BY DATE WITH SIMPLE CACHE
    habitLogsByDate: async (date) => {
        console.log(`[habitLogsByDate] Called with date:`, date);
        set({ 
            isLoading: true, 
            error: null 
        });

        try {
            const {useAuthStore} = await import('./auth.store');
            const {user, token} = useAuthStore.getState();
            const timezone = user?.timezone || 'Europe/Istanbul';
            
            console.log(`[habitLogsByDate] Auth check - User:`, !!user, 'Token:', !!token, 'User ID:', user?._id);
            
            // Check authentication
            if (!user || !token || !user._id) {
                console.log(`[habitLogsByDate] No authentication, returning empty data`);
                return { 
                    success: true, 
                    data: { 
                        summary: { completedHabits: 0, totalHabits: 0, completionRate: 0, inProgressHabits: 0, notStartedHabits: 0 }, 
                        habits: [] 
                    } 
                };
            }

            const dateToLocalYYYYMMDD = (d, tz) => new Intl.DateTimeFormat('en-CA', { 
                timeZone: tz, 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            }).format(d);

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

            // Try to get from AsyncStorage cache first
            const cached = await getCachedDayData(user._id, requestDate);
            if (cached) {
                console.log(`[habitLogsByDate] Using cached data for ${localDateStr}`);
                set({ isLoading: false });
                return cached;
            }

            console.log(`[habitLogsByDate] Loading fresh data from API for ${localDateStr}`);
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
                const serverHabits = data.data.habits || [];

                // NORMALIZE SERVER ITEMS INTO CONSISTENT SHAPE
                const normalized = serverHabits.map(item => {
                    if (item && item.habit) {
                        return {
                            habit: {
                                id: item.habit.id || item.habit._id || (item.habit && item.habit.toString && item.habit.toString()),
                                name: item.habit.name,
                                icon: item.habit.icon,
                                createdAt: item.habit.createdAt
                            },
                            log: item.log || null,
                            progress: typeof item.progress !== 'undefined' ? item.progress : (item.log ? item.log.progress : 0),
                            completed: typeof item.completed !== 'undefined' ? item.completed : (item.log ? !!item.log.completed : false)
                        };
                    }

                    // FALLBACK: SERVER RETURNED A RAW HABIT OBJECT
                    if (item && (item._id || item.id)) {
                        return {
                            habit: { 
                                id: item._id || item.id, 
                                name: item.name, 
                                icon: item.icon, 
                                createdAt: item.createdAt 
                            },
                            log: item.log || null,
                            progress: typeof item.progress !== 'undefined' ? item.progress : (item.log ? item.log.progress : 0),
                            completed: typeof item.completed !== 'undefined' ? item.completed : (item.log ? !!item.log.completed : false)
                        };
                    }

                    // UNKNOWN SHAPE -> KEEP MINIMAL
                    return { 
                        habit: { 
                            id: null, 
                            name: null, 
                            icon: null, 
                            createdAt: null 
                        }, 
                        log: null, 
                        progress: 0, 
                        completed: false 
                    };
                });

                // FILTER OUT HABITS CREATED AFTER THE TARGET DAY
                const endOfLocalDay = new Date(requestDate.getTime() + 24 * 60 * 60 * 1000 - 1);
                const activeHabits = normalized.filter(h => {
                    if (h.habit && h.habit.status === 'never_started') return false;
                    if (!h.habit || !h.habit.createdAt) return true;
                    const created = new Date(h.habit.createdAt).getTime();
                    return created <= endOfLocalDay.getTime();
                });

                const summary = data.data.summary || {};
                const result = { 
                    success: true, 
                    data: { 
                        summary: { ...summary }, 
                        habits: activeHabits 
                    } 
                };

                console.log(`[habitLogsByDate] Returning result for ${localDateStr}:`, result);

                // Cache the successful result
                await setCachedDayData(user._id, requestDate, result);

                return result;
            }
        } catch (error) {
            console.error('[habitLogsByDate] Error:', error);
            set({ 
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            
            // IF AUTHENTICATION ERROR, RETURN EMPTY RESULT INSTEAD OF ERROR
            if (error.message.includes("Not authenticated") || 
                error.message.includes("Session expired") || 
                error.message.includes("No authentication token available")) {
                console.log(`[habitLogsByDate] Authentication error, returning empty data`);
                return { 
                    success: true, 
                    data: { 
                        summary: { completedHabits: 0, totalHabits: 0, completionRate: 0, inProgressHabits: 0, notStartedHabits: 0 }, 
                        habits: [] 
                    } 
                };
            }
            
            console.log(`[habitLogsByDate] Network error, returning failure`);
            return { 
                success: false, 
                error: error.message || 'Network error. Please try again.' 
            };
        }
    },

    // CLEAR CACHE FOR TODAY (useful after habit modifications)
    clearTodayCache: async () => {
        try {
            const {useAuthStore} = await import('./auth.store');
            const {user} = useAuthStore.getState();
            if (user?._id) {
                const today = new Date();
                await clearCacheForDay(user._id, today);
                console.log('Today\'s cache cleared successfully');
            }
        } catch (error) {
            console.warn('Failed to clear today\'s cache:', error);
        }
    },

    // CLEAR ALL CACHE (useful for troubleshooting)
    clearAllHabitCache: async () => {
        try {
            const {useAuthStore} = await import('./auth.store');
            const {user} = useAuthStore.getState();
            if (user?._id) {
                await clearAllCache(user._id);
                console.log('All habit cache cleared successfully');
            }
        } catch (error) {
            console.warn('Failed to clear all cache:', error);
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
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            return { 
                success: false, 
                message: error.message || 'Network error. Please try again.' 
            };
        }
    },

    // CLEAR STORE
    clearStore: () => {
        set({
            monthlyCache: {},
            habits: [],
            goals: [],
            presets: [],
            isLoading: false,
            error: null,
            lastFetchDate: null
        });
    },
}));