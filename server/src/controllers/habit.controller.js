import ApiError from '../utils/error.js';
import Habit from '../models/habit.js';
import HabitLog from '../models/habit.log.js';
import User from '../models/user.js';
import Goal from '../models/goal.js';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { DEFAULT_TZ, resolveUserTimezone, tzDayRange } from '../utils/timezone.js';

const HABIT_PRESETS = {
    health: [
        {
            name: "Water",
            translationKey: "habits.water",
            icon: "water-outline",
            unit: "glasses",
            targetAmount: 8,
            incrementAmount: 1,
            availableUnits: ["glasses", "liters", "cups"]
        },
        {
            name: "Food",
            translationKey: "habits.food",
            icon: "restaurant-outline",
            unit: "meals",
            targetAmount: 3,
            incrementAmount: 1,
            availableUnits: ["meals", "servings", "portions"]
        },
        {
            name: "Walking",
            translationKey: "habits.walking",
            icon: "walk-outline",
            unit: "steps",
            targetAmount: 10000,
            incrementAmount: 1000,
            availableUnits: ["steps", "kilometers", "minutes"]
        },
        {
            name: "Exercise",
            translationKey: "habits.exercise",
            icon: "barbell-outline",
            unit: "minutes",
            targetAmount: 30,
            incrementAmount: 15,
            availableUnits: ["minutes", "hours", "sessions"]
        },
        {
            name: "Reading",
            translationKey: "habits.reading",
            icon: "book-outline",
            unit: "pages",
            targetAmount: 20,
            incrementAmount: 5,
            availableUnits: ["pages", "minutes", "chapters"]
        },
        {
            name: "Sleep",
            translationKey: "habits.sleep",
            icon: "moon-outline",
            unit: "hours",
            targetAmount: 8,
            incrementAmount: 1,
            availableUnits: ["hours", "minutes"]
        }
    ]
};


// HOME PAGE
export const getDashboardHabits = async (req, res) => {
    try {
        const userId = req.user.id;
    const user = await User.findById(userId);
    const userTimezone = user?.timezone || DEFAULT_TZ;
    const { start: todayStart, end: todayEnd } = tzDayRange(undefined, userTimezone);
        if (!req.user || !req.user.id)
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
                error: "User not authenticated"
            });
        const habits = await Habit.find({ 
            userId, 
            isActive: true 
        }).sort({ 
            createdAt: -1 
        });

        const todayLogs = await HabitLog.find({
            userId,
            date: {
                $gte: todayStart,
                $lt: todayEnd
            }
        });

        const habitsWithProgress = habits.map(habit => {
            const todayLog = todayLogs.find(log => 
                log.habitId.toString() === habit._id.toString()
            );
            
            const todayValue = todayLog ? todayLog.value : 0;
            const progress = Math.min(todayValue / habit.targetAmount, 1);
            const completed = progress >= 1;

            return {
                id: habit._id,
                name: habit.name,
                translationKey: habit.translationKey,
                type: habit.type,
                category: habit.category,
                icon: habit.icon,
                unit: habit.unit,
                targetAmount: habit.targetAmount,
                incrementAmount: habit.incrementAmount,
                availableUnits: habit.availableUnits,
                isActive: habit.isActive,
                createdAt: habit.createdAt,
                updatedAt: habit.updatedAt,
                todayProgress: {
                    value: todayValue,
                    progress,
                    completed
                }
            };
        });

        const summary = {
            totalHabits: habits.length,
            completedToday: habitsWithProgress.filter(h => h.todayProgress.completed).length,
            inProgress: habitsWithProgress.filter(h => h.todayProgress.value > 0 && !h.todayProgress.completed).length
        };

        res.status(200).json({
            success: true,
            message: "Dashboard data retrieved successfully",
            data: {
                habits: habitsWithProgress,
                summary
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Dashboard data retrieval failed"
        });
    }
};

export const addHabit = async (req, res) => {
    try {
        const userId = req.user.id;
        const {name, type, category, icon, unit, targetAmount, incrementAmount, availableUnits} = req.body;

        if (!name || !category || !type)
            throw new ApiError("Name, category and type are required.", 400);

        let habitData = {};

        if (type === 'default') {
            if (!unit || !targetAmount || !incrementAmount)
                throw new ApiError("For preset habits: name, type, category, unit, targetAmount and incrementAmount are required.", 400);
            
            const preset = HABIT_PRESETS.health.find(p => p.name === name);
            if (!preset)
                throw new ApiError(`Preset habit '${name}' not found. 
                                    Available presets: ${HABIT_PRESETS.health.map(p => p.name).join(', ')}`, 400);
            
            if (!preset.availableUnits.includes(unit))
                throw new ApiError(`Invalid unit '${unit}' for ${name}. 
                                    Available units: ${preset.availableUnits.join(', ')}`, 400);
            
            habitData = {
                userId,
                name: preset.name,
                translationKey: preset.translationKey,
                type: 'default',
                category,
                icon: preset.icon, 
                unit, 
                targetAmount,
                incrementAmount,
                availableUnits: preset.availableUnits
            };
        } else if (type === 'other') {
            if (!icon || !unit || !targetAmount || !incrementAmount)
                throw new ApiError("For custom habits: icon, unit, targetAmount and incrementAmount are required.", 400);
            
            habitData = {
                userId,
                name,
                type: 'other',
                category,
                icon,
                unit,
                targetAmount,
                incrementAmount,
                availableUnits: availableUnits || []
            };
        } else {
            throw new ApiError("Type must be 'default' (preset) or 'other' (custom).", 400);
        }

        const existingHabit = await Habit.findOne({ userId, name: habitData.name, isActive: true });
        if (existingHabit)
            throw new ApiError("A habit with this name already exists.", 400);

        const newHabit = new Habit(habitData);
        await newHabit.save();

        res.status(201).json({
            success: true,
            message: "Habit created successfully",
            data: {
                id: newHabit._id,
                name: newHabit.name,
                translationKey: newHabit.translationKey,
                type: newHabit.type,
                category: newHabit.category,
                icon: newHabit.icon,
                unit: newHabit.unit,
                targetAmount: newHabit.targetAmount,
                incrementAmount: newHabit.incrementAmount,
                availableUnits: newHabit.availableUnits
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Habit creation failed."
        });
    }
};

export const detailHabit = async (req, res) => {
    try {
        const userId = req.user.id;
        const habitId = req.params.id;
        const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
        if (!habit)
            throw new ApiError("Habit not found.", 404);

        const userTimezone = await resolveUserTimezone(userId);
        const { start: todayStartLog, end: todayEndLog } = tzDayRange(undefined, userTimezone);
        const todayLog = await HabitLog.findOne({
            habitId,
            userId,
            date: {
                $gte: todayStartLog,
                $lt: todayEndLog
            }
        });

        const todayValue = todayLog ? todayLog.value : 0;
        const progress = Math.min(todayValue / habit.targetAmount, 1);
        const completed = progress >= 1;

        res.status(200).json({
            success: true,
            message: "Habit details retrieved successfully",
            data: {
                id: habit._id,
                name: habit.name,
                translationKey: habit.translationKey,
                type: habit.type,
                category: habit.category,
                icon: habit.icon,
                unit: habit.unit,
                targetAmount: habit.targetAmount,
                incrementAmount: habit.incrementAmount,
                availableUnits: habit.availableUnits,
                isActive: habit.isActive,
                createdAt: habit.createdAt,
                updatedAt: habit.updatedAt,
                todayProgress: {
                    value: todayValue,
                    progress,
                    completed
                }
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Habit details retrieval failed"
        });
    }
};

export const updateHabit = async (req, res) => {
    try {
        const userId = req.user.id;
        const habitId = req.params.id;
        const {targetAmount, incrementAmount, unit, name, icon} = req.body;

        const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
        if (!habit)
            throw new ApiError("Habit not found.", 404);

        const updateData = {};
        let shouldResetProgress = false;
        
        if (targetAmount !== undefined) {
            if (targetAmount <= 0)
                throw new ApiError("Target amount must be greater than 0.", 400);
            
            if (habit.targetAmount !== targetAmount)
                shouldResetProgress = true;
            updateData.targetAmount = targetAmount;
        }
        
        if (incrementAmount !== undefined) {
            if (incrementAmount <= 0)
                throw new ApiError("Increment amount must be greater than 0.", 400);
            if (habit.incrementAmount !== incrementAmount)
                shouldResetProgress = true;
            updateData.incrementAmount = incrementAmount;
        }
        
        if (unit !== undefined) {
            if (habit.type === 'default' && habit.availableUnits && habit.availableUnits.length > 0) {
                if (!habit.availableUnits.includes(unit)) 
                    throw new ApiError(`Invalid unit '${unit}' for this preset habit. Available units: ${habit.availableUnits.join(', ')}`, 400);
                
            }
            if (habit.unit !== unit)
                shouldResetProgress = true;

            updateData.unit = unit;
        }

        if (icon !== undefined) {
            if (habit.type === 'default') {
                throw new ApiError("Icon cannot be changed for preset habits.", 400);
            }
            if (!icon || icon.trim() === '') {
                throw new ApiError("Icon is required for custom habits.", 400);
            }
            updateData.icon = icon;
        }

        if (name !== undefined) {
            if (habit.type === 'default')
                throw new ApiError("Name cannot be changed for preset habits.", 400);
            
            const existingHabit = await Habit.findOne({ 
                userId, 
                name, 
                isActive: true,
                _id: { $ne: habitId }
            });

            if (existingHabit)
                throw new ApiError("A habit with this name already exists.", 400);
            updateData.name = name;
        }

        if (shouldResetProgress) {
            const userTimezone = await resolveUserTimezone(userId);
            const { start: todayStartDel, end: todayEndDel } = tzDayRange(undefined, userTimezone);

            await HabitLog.deleteMany({
                habitId: habitId,
                userId: userId,
                date: {
                    $gte: todayStartDel,
                    $lt: todayEndDel
                }
            });
        }

        const updatedHabit = await Habit.findByIdAndUpdate(
            habitId,
            updateData, { 
                new: true, 
                runValidators: true 
            }
        );

        res.status(200).json({
            success: true,
            message: "Habit updated successfully",
            data: {
                id: updatedHabit._id,
                name: updatedHabit.name,
                icon: updatedHabit.icon,
                unit: updatedHabit.unit,
                targetAmount: updatedHabit.targetAmount,
                incrementAmount: updatedHabit.incrementAmount
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Habit update failed"
        });
    }
};

export const deleteHabit = async (req, res) => {
    try {
        const userId = req.user.id;
        const habitId = req.params.id;
        
        const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
        if (!habit)
            throw new ApiError("Habit not found.", 404);


        await Habit.deleteOne({ _id: habitId, userId });
        await HabitLog.deleteMany({ habitId, userId });

        res.status(200).json({
            success: true,
            message: "Habit deleted successfully"
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Habit deletion failed"
        });
    }
};

export const getIncrementHabit = async (req, res) => {
    try {
    const userId = req.user.id;
    const habitId = req.params.id;

    const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
        if (!habit)
            throw new ApiError("Habit not found.", 404);

        const incrementValue = habit.incrementAmount;
        const userTimezone = await resolveUserTimezone(userId);
        const { start: dayDate } = tzDayRange(undefined, userTimezone);

        const updatedLog = await HabitLog.findOneAndUpdate(
            {
                habitId,
                userId,
                date: dayDate
            },
            {
                $inc: { value: incrementValue },
                $setOnInsert: {
                    habitId,
                    userId,
                    date: dayDate
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        const progress = Math.min(updatedLog.value / habit.targetAmount, 1);
        const completed = progress >= 1;

        if (updatedLog.completed !== completed) {
            updatedLog.completed = completed;
            await updatedLog.save();
        }

        res.status(200).json({
            success: true,
            message: `${incrementValue} ${habit.unit} added successfully`,
            data: {
                habitId: habit._id,
                newValue: updatedLog.value,
                targetAmount: habit.targetAmount,
                progress,
                completed,
                unit: habit.unit,
                incrementedBy: incrementValue
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({  
            success: false,
            message: error.message || "Habit increment failed"
        });
    }
};


// HISTORY PAGE
export const getHabitProgress = async (req, res) => {
    try {
        const {habitId} = req.params;
        const {year, month, startDate, endDate} = req.query;
        const userId = req.user.id;

        const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
        if (!habit)
            throw new ApiError("Habit not found.", 404);
        
        const userTimezone = await resolveUserTimezone(userId);
        let dateFilter = {};
        if (startDate && endDate) {
            // treat provided ISO dates as in user's timezone start/end of day
            const { start: s } = tzDayRange(new Date(startDate), userTimezone);
            const { end: e } = tzDayRange(new Date(endDate), userTimezone);
            dateFilter = { date: { $gte: s, $lte: e } };
        } else if (year && month) {
            // start at first day of month in user's tz
            const startOfMonth = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, userTimezone);
            const { start: s } = tzDayRange(startOfMonth, userTimezone);
            const endOfMonthMoment = startOfMonth.clone().endOf('month');
            const { end: e } = tzDayRange(endOfMonthMoment, userTimezone);
            dateFilter = { date: { $gte: s, $lte: e } };
        } else {
            const now = moment.tz(userTimezone);
            const { start: s } = tzDayRange(now, userTimezone);
            const endOfMonthMoment = now.clone().endOf('month');
            const { end: e } = tzDayRange(endOfMonthMoment, userTimezone);
            dateFilter = { date: { $gte: s, $lte: e } };
        }

        const habitLogs = await HabitLog.find({
            habitId,
            userId,
            ...dateFilter
        }).sort({ date: 1 });

        const progress = habitLogs.map(log => ({
            date: log.date,
            value: log.value,
            targetAmount: habit.targetAmount,
            progress: Math.min(log.value / habit.targetAmount, 1),
            completed: log.completed,
            unit: habit.unit
        }));

        const completedDays = habitLogs.filter(log => log.completed).length;
        const totalDays = habitLogs.length;
        const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

        let currentStreak = 0;
        const sortedLogs = [...habitLogs].reverse();
        for (const log of sortedLogs) {
            if (log.completed) {
                currentStreak++;
            } else {
                break;
            }
        }

        const statistics = {
            completedDays,
            totalDays,
            completionRate,
            currentStreak,
            averageValue: totalDays > 0 ? habitLogs.reduce((sum, log) => sum + log.value, 0) / totalDays : 0
        };

        res.status(200).json({
            success: true,
            message: "Habit progress retrieved successfully",
            data: {
                habit: {
                    id: habit._id,
                    name: habit.name,
                    icon: habit.icon,
                    unit: habit.unit,
                    targetAmount: habit.targetAmount
                },
                progress,
                statistics
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to get habit progress"
        });
    }
};

export const getHabitLogsByDate = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.id;

        // Input validation
        if (!date) {
            throw new ApiError("Date parameter is required.", 400);
        }

        const userTimezone = await resolveUserTimezone(userId);

        // Optimized date parsing with better validation
        let targetMoment;
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            targetMoment = moment.tz(date + 'T00:00:00', userTimezone);
        } else {
            targetMoment = moment.tz(date, userTimezone);
        }

        if (!targetMoment?.isValid()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid date parameter. Use YYYY-MM-DD or ISO datetime.' 
            });
        }

        const targetDate = targetMoment.toDate();
        const { start: startOfDay, end: endOfDay } = tzDayRange(targetMoment, userTimezone);

        // OPTIMIZED: Single aggregation pipeline instead of multiple queries
        const habitsWithLogs = await Habit.aggregate([
            // Match active habits for user
            {
                $match: { 
                    userId: new mongoose.Types.ObjectId(userId), 
                    isActive: true 
                }
            },
            // Left join with habit logs for the specific date
            {
                $lookup: {
                    from: 'habitlogs',
                    let: { habitId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$habitId', '$$habitId'] },
                                        { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
                                        { $gte: ['$date', startOfDay] },
                                        { $lt: ['$date', endOfDay] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'dailyLogs'
                }
            },
            // Transform and calculate progress in a single step
            {
                $addFields: {
                    logExists: { $gt: [{ $size: '$dailyLogs' }, 0] },
                    logData: { $arrayElemAt: ['$dailyLogs', 0] }
                }
            },
            {
                $project: {
                    habit: {
                        id: '$_id',
                        name: '$name',
                        icon: '$icon',
                        unit: '$unit',
                        targetAmount: '$targetAmount'
                    },
                    log: {
                        $cond: {
                            if: '$logExists',
                            then: {
                                id: '$logData._id',
                                value: '$logData.value',
                                completed: '$logData.completed',
                                date: '$logData.date',
                                progress: {
                                    $min: [
                                        { $divide: ['$logData.value', '$targetAmount'] },
                                        1
                                    ]
                                }
                            },
                            else: null
                        }
                    },
                    progress: {
                        $cond: {
                            if: '$logExists',
                            then: {
                                $min: [
                                    { $divide: ['$logData.value', '$targetAmount'] },
                                    1
                                ]
                            },
                            else: 0
                        }
                    },
                    completed: {
                        $cond: {
                            if: '$logExists',
                            then: '$logData.completed',
                            else: false
                        }
                    }
                }
            },
            // Sort by creation date for consistent ordering
            {
                $sort: { 'habit.id': 1 }
            }
        ]);

        // Calculate summary statistics efficiently
        const totalHabits = habitsWithLogs.length;
        let completedHabits = 0;
        let inProgressHabits = 0;

        // Single pass through results for statistics
        habitsWithLogs.forEach(item => {
            if (item.completed) {
                completedHabits++;
            } else if (item.progress > 0) {
                inProgressHabits++;
            }
        });

        const notStartedHabits = totalHabits - completedHabits - inProgressHabits;
        const activeHabits = completedHabits + inProgressHabits;
        const completionRate = activeHabits > 0 ? Math.round((completedHabits / activeHabits) * 100) : 0;

        const summary = {
            date: targetDate,
            totalHabits,
            completedHabits,
            inProgressHabits,
            notStartedHabits,
            completionRate
        };

        res.status(200).json({
            success: true,
            message: "Daily habit logs retrieved successfully",
            data: {
                summary,
                habits: habitsWithLogs
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to get habit logs by date"
        });
    }
};


// PRESETS
export const getHabitPresets = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Habit presets retrieved successfully",
            data: {
                categories: Object.keys(HABIT_PRESETS),
                presets: HABIT_PRESETS
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to get habit presets"
        });
    }
};

export const getHabitPresetsByCategory = async (req, res) => {
    try {
        const {category} = req.params;
        if (!HABIT_PRESETS[category])
            throw new ApiError(`Category '${category}' not found. Available categories: ${Object.keys(HABIT_PRESETS).join(', ')}`, 404);
        
        res.status(200).json({
            success: true,
            message: `${category.charAt(0).toUpperCase() + category.slice(1)} habit presets retrieved successfully`,
            data: {
                category,
                presets: HABIT_PRESETS[category]
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to get category presets"
        });
    }
};



// GOALS PAGE
export const getDashboardGoals = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required.' 
            });

        const userId = req.user.id;
        const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).populate('habitId', 'name icon');

        const payload = goals.map(goal => ({
            id: goal._id,
            type: goal.type,
            habit: goal.habitId ? { id: goal.habitId._id, name: goal.habitId.name, icon: goal.habitId.icon } : null,
            repeat: goal.repeat || null,
            metric: goal.metric || null,
            value: goal.value || null,
            progress: goal.progress,
            completed: goal.completed,
            createdAt: goal.createdAt,
            updatedAt: goal.updatedAt
        }));

    res.status(200).json({ 
        success: true, 
        message: 'Goals retrieved successfully', data: payload 
    });
    } catch (error) {
    res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Failed to get goals' 
    });
    }
};

export const createGoal = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required.' 
            });

        const userId = req.user.id;
        const { type, habitId, repeat, metric, value } = req.body;

    if (!type) 
        throw new ApiError('Type is required.', 400);

        const goalData = { userId, type };

        if (type === 'complete') {
            if (!habitId) 
                throw new ApiError('habitId is required for complete goals.', 400);
            
            if (!repeat || repeat <= 0) 
                throw new ApiError('repeat (number > 0) is required for complete goals.', 400);

            const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
            if (!habit) throw new ApiError('Selected preset habit not found or not accessible.', 404);

            goalData.habitId = habitId;
            goalData.repeat = repeat;
        } else if (type === 'reach') {
            if (!metric) 
                throw new ApiError('metric is required for reach goals.', 400);

            if (!['streak', 'rate'].includes(metric)) 
                throw new ApiError('metric must be "streak" or "rate".', 400);
            
            if (value === undefined || value === null) 
                throw new ApiError('value is required for reach goals.', 400);
            
            if (value <= 0) 
                throw new ApiError('value must be greater than 0.', 400);

            goalData.metric = metric;
            goalData.value = value;
        } else if (type === 'maintain') {
            // COMMING SOON
        } else {
            throw new ApiError('Invalid goal type.', 400);
        }

        const newGoal = new Goal(goalData);
        await newGoal.save();

        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            data: {
                id: newGoal._id,
                type: newGoal.type,
                habitId: newGoal.habitId || null,
                repeat: newGoal.repeat || null,
                metric: newGoal.metric || null,
                value: newGoal.value || null,
                progress: newGoal.progress,
                completed: newGoal.completed,
                createdAt: newGoal.createdAt
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || 'Goal creation failed.' 
        });
    }
};

export const deleteGoal = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ success: false, message: 'Authentication required.' });

        const userId = req.user.id;
        const goalId = req.params.id;
        const goal = await Goal.findOne({ _id: goalId, userId });
        if (!goal) throw new ApiError('Goal not found.', 404);
        
        await Goal.deleteOne({ _id: goalId });
        await Goal.deleteMany({ parentGoalId: goalId });

        res.status(200).json({ 
            success: true, 
            message: 'Goal deleted successfully' 
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || 'Goal deletion failed.' 
        });
    }
};

export const getMonthlyHabitLogs = async (req, res) => {
    try {
        const { year, month } = req.params;
        const userId = req.user.id;

        const monthlyLogs = await HabitLog.find({
            user: new mongoose.Types.ObjectId(userId),
            localDate: {
                $regex: `^${year}-${month.padStart(2, '0')}`
            }
        });

        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
        const monthData = {};
        
        for (let day = 1; day <= daysInMonth; day++) {
            monthData[day] = {
                summary: {
                    totalHabits: 0,
                    completedHabits: 0,
                    inProgressHabits: 0,
                    notStartedHabits: 0,
                    completionRate: 0,
                    date: `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}T21:00:00.000Z`
                }
            };
        }

        monthlyLogs.forEach(log => {
            const logDate = log.localDate;
            const dayMatch = logDate.match(/\d{4}-\d{2}-(\d{2})/);
            if (dayMatch) {
                const day = parseInt(dayMatch[1]);
                if (monthData[day]) {
                    monthData[day].summary.totalHabits++;
                    
                    if (log.completed) {
                        monthData[day].summary.completedHabits++;
                    } else if (log.progress > 0) {
                        monthData[day].summary.inProgressHabits++;
                    } else {
                        monthData[day].summary.notStartedHabits++;
                    }
                }
            }
        });

        Object.keys(monthData).forEach(day => {
            const summary = monthData[day].summary;
            if (summary.totalHabits > 0) {
                summary.completionRate = Math.round((summary.completedHabits / summary.totalHabits) * 100);
            }
        });

        res.status(200).json({
            success: true,
            data: monthData
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch monthly habit logs"
        });
    }
};
