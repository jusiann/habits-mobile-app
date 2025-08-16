import ApiError from '../utils/error.js';
import Habit from '../models/habit.js';
import HabitLog from '../models/habit.log.js';

const HABIT_PRESETS = {
    health: [
        {
            name: "Water Drinking",
            icon: "💧",
            unit: "glasses",
            targetAmount: 8,
            incrementAmount: 1,
            availableUnits: ["glasses", "liters", "cups"]
        },
        {
            name: "Healthy Eating",
            icon: "🥗",
            unit: "meals",
            targetAmount: 3,
            incrementAmount: 1,
            availableUnits: ["meals", "servings", "portions"]
        },
        {
            name: "Walking",
            icon: "🚶",
            unit: "steps",
            targetAmount: 10000,
            incrementAmount: 1000,
            availableUnits: ["steps", "kilometers", "minutes"]
        },
        {
            name: "Exercise",
            icon: "💪",
            unit: "minutes",
            targetAmount: 30,
            incrementAmount: 15,
            availableUnits: ["minutes", "hours", "sessions"]
        },
        {
            name: "Reading",
            icon: "📚",
            unit: "pages",
            targetAmount: 20,
            incrementAmount: 5,
            availableUnits: ["pages", "minutes", "chapters"]
        },
        {
            name: "Sleep",
            icon: "😴",
            unit: "hours",
            targetAmount: 8,
            incrementAmount: 1,
            availableUnits: ["hours", "minutes"]
        }
    ]
};

export const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        if (!req.user || !req.user.id)
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
                error: "User not authenticated"
            });
        
        today.setHours(0, 0, 0, 0);
        const habits = await Habit.find({ 
            userId, 
            isActive: true 
        }).sort({ 
            createdAt: -1 
        });

        const todayLogs = await HabitLog.find({
            userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
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
        const today = new Date();
        const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
        if (!habit)
            throw new ApiError("Habit not found.", 404);

        today.setHours(0, 0, 0, 0);
        const todayLog = await HabitLog.findOne({
            habitId,
            userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
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
        
        if (targetAmount !== undefined) {
            if (targetAmount <= 0)
                throw new ApiError("Target amount must be greater than 0.", 400);
            updateData.targetAmount = targetAmount;
        }
        
        if (incrementAmount !== undefined) {
            if (incrementAmount <= 0)
                throw new ApiError("Increment amount must be greater than 0.", 400);
            updateData.incrementAmount = incrementAmount;
        }
        
        if (unit !== undefined) {
            if (habit.type === 'default' && habit.availableUnits && habit.availableUnits.length > 0) {
                if (!habit.availableUnits.includes(unit)) {
                    throw new ApiError(`Invalid unit '${unit}' for this preset habit. Available units: ${habit.availableUnits.join(', ')}`, 400);
                }
            }
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
            if (habit.type === 'default') {
                throw new ApiError("Name cannot be changed for preset habits.", 400);
            }
            
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
        //opsiyonel
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
        const today = new Date();
        
        const habit = await Habit.findOne({ _id: habitId, userId, isActive: true });
        if (!habit)
            throw new ApiError("Habit not found.", 404);

        const incrementValue = habit.incrementAmount;
        today.setHours(0, 0, 0, 0);
        
        const updatedLog = await HabitLog.findOneAndUpdate(
            {
                habitId,
                userId,
                date: today
            },
            {
                $inc: { value: incrementValue },
                $setOnInsert: {
                    habitId,
                    userId,
                    date: today
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



export const getHabitProgress = async (req, res) => {};



export const getHabitLogs = async (req, res) => {};

export const getHabitLogsByDate = async (req, res) => {};



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
