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
    timezone: {
        type: String,
        default: 'Europe/Istanbul',
    },
    resetCode: {
        type: String
    },
    resetCodeExpires: {
        type: Date
    },
    blacklistedTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 86400
        }
    }]
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;