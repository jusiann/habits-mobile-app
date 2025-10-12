import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['complete', 'reach', 'maintain'],
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: function () {
      return this.type === 'complete';
    }
  },
  repeat: {
    type: Number,
    required: function () {
      return this.type === 'complete';
    }
  },
  metric: {
    type: String,
    enum: ['streak', 'rate'],
    required: function () {
      return this.type === 'reach';
    }
  },
  value: {
    type: Number,
    required: function () {
      return this.type === 'reach';
    }
  },
  progress: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Performance optimization indexes
GoalSchema.index({ userId: 1 }); // Existing basic index
GoalSchema.index({ userId: 1, type: 1 }); // Goal type filtering
GoalSchema.index({ userId: 1, completed: 1 }); // Active/completed goal queries
GoalSchema.index({ userId: 1, habitId: 1 }, { sparse: true }); // Habit-specific goals
GoalSchema.index({ habitId: 1, completed: 1 }, { sparse: true }); // Habit goal completion
GoalSchema.index({ completed: 1, createdAt: 1 }); // Global goal stats
GoalSchema.index({ type: 1, metric: 1 }, { sparse: true }); // Goal analytics

const Goal = mongoose.model('Goal', GoalSchema);

export default Goal;
