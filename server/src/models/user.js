import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    gender:{
        type: String
    },
    age: {
        type: Number,
        default: 0,
    },
    height: {
        type: Number,
        default: 0,
    },
    weight: {
        type: Number,
        default: 0,
    },
    profilePicture: {
        type: String,
        default: '',
    },
    language: {
        type: String,
        enum: ['en', 'tr'],
        default: 'en',
    },
    theme: {
        type: String,
        enum: ['forest', 'lightning', 'retro', 'ocean', 'blossom', 'orange'],
        default: 'lightning',
    },
    timezone: {
        type: String,
        default: 'Europe/Istanbul',
    },
    resetCode: {
        type: String
    },
    resetCodeExpires: {
        type: Date
    }
}, {
    timestamps: true
});

// Performance optimization indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ timezone: 1 });
userSchema.index({ resetCode: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);

export default User;