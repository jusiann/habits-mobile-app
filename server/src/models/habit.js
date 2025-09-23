import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    translationKey: {
        type: String,
        default: null
    },
    type: {
        type: String,
        enum: ['other', 'default'],
        default: 'other',
        required: true
    },
    category: {
        type: String,
        enum: ['health', 'education', 'productivity', 'social', 'wellness', 'other'],
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: function() {
            return this.type === 'other';
        }
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    incrementAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    availableUnits: [String],
}, {
    timestamps: true,
});

habitSchema.index({ userId: 1, name: 1 }, { unique: true });
habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ category: 1 });

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;