import {create} from "zustand";
import {makeAuthenticatedRequest, API_ENDPOINTS} from "../constants/api.utils";
import {getTodayInUserTZ, isNewDayInUserTZ} from "../constants/timezone.utils";

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
  
    // LOAD MONTH DATA
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

            let totalDaysWithData = 0;
            let totalCompletionRateSum = 0;
            let totalCompletedHabits = 0;
            let currentStreakCount = 0;

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
                    }
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
                    // Different month, need to query API
                    const result = await get().habitLogsByDate(streakDate);
                    if (result.success && result.data) {
                        dayData = { summary: result.data.summary };
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

    // HABIT LOGS BY DATE
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
            set({ 
                error: error.message || 'An error occurred', 
                isLoading: false 
            });
            
            // IF AUTHENTICATION ERROR, RETURN EMPTY RESULT INSTEAD OF ERROR
            if (error.message.includes("Not authenticated") || 
                error.message.includes("Session expired") || 
                error.message.includes("No authentication token available")) {
                return { 
                    success: true, 
                    data: { 
                        summary: { completedHabits: 0, totalHabits: 0, completionRate: 0 }, 
                        habits: [] 
                    } 
                };
            }
            
            return { 
                success: false, 
                error: error.message || 'Network error. Please try again.' 
            };
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