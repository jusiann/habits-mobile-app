import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema({
    habitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Performance optimization indexes - Critical for daily queries
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true }); // Existing unique constraint
habitLogSchema.index({ userId: 1, date: 1 }); // Most used query pattern
habitLogSchema.index({ userId: 1, date: 1, completed: 1 }); // Daily stats queries
habitLogSchema.index({ habitId: 1, userId: 1, date: 1 }); // Aggregation pipeline optimization
habitLogSchema.index({ date: 1, completed: 1 }); // Global statistics
habitLogSchema.index({ userId: 1, completed: 1, date: 1 }); // User completion stats
habitLogSchema.index({ createdAt: 1 }); // Cleanup and maintenance queries

const HabitLog = mongoose.model("HabitLog", habitLogSchema);

export default HabitLog;