import ApiError from '../utils/error.js';
import User from '../models/user.js';
import { createToken } from '../middlewares/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/send.email.js';

const validatePassword = (password) => {
    if (password.length < 8) {
        throw new ApiError("Password must be at least 8 characters long.", 400);
    }
    
    if (!/[A-Z]/.test(password)) {
        throw new ApiError("Password must contain at least one uppercase letter.", 400);
    }
    
    if (!/[a-z]/.test(password)) {
        throw new ApiError("Password must contain at least one lowercase letter.", 400);
    }
    
    if (!/[0-9]/.test(password)) {
        throw new ApiError("Password must contain at least one number.", 400);
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new ApiError("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>).", 400);
    }
};

export const signUp = async (req, res) => {
    try {
        const {email, username, fullname, password} = req.body;
        if (!username || !fullname || !email || !password) 
            throw new ApiError("username, fullname, email and password are required.", 400);
        
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email))
            throw new ApiError("Invalid email format. Please enter a valid email address.", 400);


        if (username.length < 3 || username.length > 30)
            throw new ApiError("Username must be between 3 and 30 characters long.", 400);

        if (fullname.length < 2 || fullname.length > 50)
            throw new ApiError("Full name must be between 2 and 50 characters long.", 400);

        validatePassword(password);

        const existingUser = await User.findOne({
            $or: [{ 
                email: email ? email.toLowerCase() : undefined 
            }, { 
                username: username ? username.toLowerCase() : undefined
            }].filter(condition => Object.values(condition).some(value => value !== undefined))
        });
        
        if (existingUser)
            throw new ApiError("Email or username already exists.", 400);
        

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=random&color=fff&size=256`;

        const user = new User({
            email,
            username,
            fullname,
            password: hashedPassword,
            profilePicture
        });

        await user.save();
        
        const {accessToken, refreshToken} = createToken(user);

        res.status(201).json({
            success: true,
            message: "Sign-up successful",
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                profilePicture: user.profilePicture,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                age: user.age,
                timezone: user.timezone,
                language: user.language
            }   
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message || "Sign-up failed" 
        });
    }
};

export const signIn = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        if (!password || (!username && !email))
            throw new ApiError("Either username or email, and password are required.", 400);
        
        const searchCriteria = [];
        if (email) {
            searchCriteria.push({ email: email.toLowerCase() });
        }
        if (username) {
            searchCriteria.push({ username: username.toLowerCase() });
        }
        
        const existingUser = await User.findOne({
            $or: searchCriteria
        });

        if (!existingUser)
            throw new ApiError("User not found. Please check your username or email.", 404);

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid)
            throw new ApiError("Invalid password. Please try again.", 401);

        const {accessToken, refreshToken} = createToken(existingUser);

        res.status(200).json({
            success: true,
            message: "Sign-in successful",
            accessToken,
            refreshToken,
            user: {
                _id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                fullname: existingUser.fullname,
                profilePicture: existingUser.profilePicture,
                gender: existingUser.gender,
                height: existingUser.height,
                weight: existingUser.weight,
                age: existingUser.age,
                timezone: existingUser.timezone,
                language: existingUser.language
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            success: false,
            message: error.message || "Sign-in failed"
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const {refreshToken} = req.body;
        if (!refreshToken)
            throw new ApiError("Refresh token is required.", 401);

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
        const user = await User.findById(decoded.userId);
        
        if (!user)
            throw new ApiError("User not found.", 404);

        const isBlacklisted = user.blacklistedTokens.some(
            tokenObj => tokenObj.token === refreshToken
        );
        
        if (isBlacklisted)
            throw new ApiError("Refresh token has been invalidated. Please login again.", 401);

        user.blacklistedTokens.push({
            token: refreshToken
        });

        await user.save();

        const {accessToken, refreshToken: newRefreshToken} = createToken(user);

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                profilePicture: user.profilePicture,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                age: user.age
            }
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError)
            res.status(401).json({
                success: false,
                message: "Refresh token has expired"
            });
        else if (error instanceof jwt.JsonWebTokenError)
            res.status(403).json({
                success: false,
                message: "Invalid refresh token"
            });
        else
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Token refresh failed"
            });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email)
            throw new ApiError("Email is required.", 400);

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email))
            throw new ApiError("Invalid email format. Please enter a valid email address.", 400);

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new ApiError("User with this email does not exist.", 404);

        const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); 

        user.resetCode = resetCode;
        user.resetCodeExpires = resetCodeExpires;
        await user.save();

        // SEND RESET CODE VIA EMAIL
        const emailSubject = "Password Reset Code";
        const emailText = `Your password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Code</h2>
                <p>Your password reset code is:</p>
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
                </div>
                <p style="color: #666;">This code will expire in <strong>15 minutes</strong>.</p>
                <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
            </div>
        `;

        await sendEmail(email, emailSubject, emailText, emailHtml);

        console.log(`Reset code sent to ${email}: ${resetCode}`);

        res.status(200).json({
            success: true,
            message: "Reset code sent to your email"
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Password reset failed"
        });
    }
};

export const checkResetToken = async (req, res) => {
    try {
        const {resetCode} = req.body;
        if (!resetCode)
            throw new ApiError("Reset code is required.", 400);

        const user = await User.findOne({ 
            resetCode: resetCode.toUpperCase(),
            resetCodeExpires: { $gt: new Date() }
        });

        if (!user)
            throw new ApiError("Invalid or expired reset code.", 400);

        const temporaryToken = jwt.sign({ 
                userId: user._id,
                email: user.email,
                type: "reset"
            }, process.env.JWT_SECRET_KEY, { 
                expiresIn: '5m' 
            }
        );

        res.status(200).json({
            success: true,
            message: "Reset code verified successfully",
            temporaryToken,
            email: user.email
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Reset code verification failed"
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const {password, temporaryToken} = req.body;

        if (!password || !temporaryToken)
            throw new ApiError("Password and temporary token are required.", 400);

        validatePassword(password);

        const decoded = jwt.verify(temporaryToken, process.env.JWT_SECRET_KEY);
        if (decoded.type !== "reset")
            throw new ApiError("Invalid temporary token type.", 401);

        const user = await User.findById(decoded.userId);
        if (!user)
            throw new ApiError("User not found.", 404);

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword)
            throw new ApiError("New password must be different from the current password.", 400);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError)
            res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        else
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Password change failed"
            });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, gender, height, weight, age, profilePicture, timezone, language, currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        
        if (!fullname && !gender && !height && !weight && !age && !profilePicture && !timezone && !language && !currentPassword && !newPassword)
            throw new ApiError("At least one field (fullname, gender, height, weight, age, profilePicture, timezone, language, currentPassword, newPassword) is required.", 400);
        
        const user = await User.findById(userId);
        if (!user)
            throw new ApiError("User not found.", 404);
        
        if ((currentPassword && !newPassword) || (!currentPassword && newPassword))
            throw new ApiError("Both current password and new password are required for password change.", 400);

        let updateData = {};
        let passwordChanged = false;
        
        if (fullname) {
            if (fullname.length < 2)
                throw new ApiError("Full name must be at least 2 characters long.", 400);
            updateData.fullname = fullname;
        }
        
        if (gender) {
            if (!['male', 'female', 'other'].includes(gender.toLowerCase()))
                throw new ApiError("Gender must be male, female, or other.", 400);
            updateData.gender = gender.toLowerCase();
        }
        
        if (height !== undefined) {
            if (height < 0 || height > 300)
                throw new ApiError("Height must be between 0 and 300 cm.", 400);
            updateData.height = height;
        }
        
        if (weight !== undefined) {
            if (weight < 0 || weight > 500)
                throw new ApiError("Weight must be between 0 and 500 kg.", 400);
            updateData.weight = weight;
        }
        
        if (age !== undefined) {
            if (age < 0 || age > 150)
                throw new ApiError("Age must be between 0 and 150 years.", 400);
            updateData.age = age;
        }
        
        if (profilePicture)
            updateData.profilePicture = profilePicture;

        if (timezone)
            updateData.timezone = timezone;

        if (language) {
            if (!['en', 'tr'].includes(language))
                throw new ApiError("Language must be 'en' or 'tr'.", 400);
            updateData.language = language;
        }

        if (currentPassword && newPassword) {
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid)
                throw new ApiError("Current password is incorrect.", 401);

            // Validate new password strength
            validatePassword(newPassword);

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            updateData.password = hashedNewPassword;
            passwordChanged = true;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        let message;
        if (passwordChanged)
            message = "Password updated successfully";
        else
            message = "Profile updated successfully";
        

        res.status(200).json({
            success: true,
            message: message,
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                fullname: updatedUser.fullname,
                gender: updatedUser.gender,
                height: updatedUser.height,
                weight: updatedUser.weight,
                age: updatedUser.age,
                profilePicture: updatedUser.profilePicture,
                timezone: updatedUser.timezone,
                language: updatedUser.language
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Profile update failed"
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user)
            throw new ApiError("User not found.", 404);

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                age: user.age,
                profilePicture: user.profilePicture,
                timezone: user.timezone,
                language: user.language
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to get user data"
        });
    }
};

export const logout = async (req, res) => {
    try {
        const userId = req.user._id;
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.split(' ')[1];
        
        if (!userId)
            throw new ApiError("User not found.", 404);
            
        if (!accessToken)
            throw new ApiError("Access token not found.", 400);

        const user = await User.findById(userId);
        if (!user)
            throw new ApiError("User not found.", 404);

        user.blacklistedTokens.push({
            token: accessToken
        });

        await user.save();

        console.log(`User ${userId} logged out at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: "Logged out successfully. Access token has been invalidated."
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Logout failed"
        });
    }
};

export const deleteUser = async (req, res) => {
    try{
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user)
            throw new ApiError("User not found.", 404);

        await Promise.all([
            Habit.deleteMany({ userId: userId }),
            Log.deleteMany({ userId: userId }),
            Goal.deleteMany({ userId: userId })
        ]);
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully."
        }); 
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Account deletion failed"
        });
    }
};
