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

GoalSchema.index({ userId: 1 });

const Goal = mongoose.model('Goal', GoalSchema);

export default Goal;
