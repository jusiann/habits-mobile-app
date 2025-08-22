import ApiError from '../utils/error.js';
import User from '../models/user.js';
import { createToken } from '../middlewares/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// const validateEmail = (email) => {
//     const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
//     if (!emailRegex.test(email)) {
//         throw new ApiError("Invalid email format. Please enter a valid email address.", 400);
//     }
    
//     // const allowedDomains = ['stu.rumeli.edu.tr'];
//     // const domain = email.split('@')[1];
//     // if (!allowedDomains.includes(domain)) {
//     //     throw new ApiError("Only Rumeli University email addresses (@stu.rumeli.edu.tr) are allowed to register.", 400);
//     // }
// };

// const validatePassword = (password) => {
//     if (password.length < 8) {
//         throw new ApiError("Password must be at least 8 characters long.", 400);
//     }
    
//     if (!/[A-Z]/.test(password)) {
//         throw new ApiError("Password must contain at least one uppercase letter.", 400);
//     }
    
//     if (!/[a-z]/.test(password)) {
//         throw new ApiError("Password must contain at least one lowercase letter.", 400);
//     }
    
//     if (!/[0-9]/.test(password)) {
//         throw new ApiError("Password must contain at least one number.", 400);
//     }
    
//     if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
//         throw new ApiError("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>).", 400);
//     }
// };

export const signUp = async (req, res) => {
    try {
        const {email, username, fullname, password} = req.body;
        if (!username || !fullname || !email || !password) 
            throw new ApiError("username, fullname, email and password are required.", 400);
        
        const existingUser = await User.findOne({
            $or: [{ 
                email: email 
            }, { 
                username: username
            }]
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
                profilePicture: user.profilePicture
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
        
        const existingUser = await User.findOne({
            $or: [{ 
                email: email 
            }, { 
                username: username
            }]
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
                profilePicture: existingUser.profilePicture
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
                profilePicture: user.profilePicture
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

        const user = await User.findOne({ email });
        if (!user)
            throw new ApiError("User with this email does not exist.", 404);

        const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); 

        user.resetCode = resetCode;
        user.resetCodeExpires = resetCodeExpires;
        await user.save();

        console.log(`Reset code for ${email}: ${resetCode}`);

        res.status(200).json({
            success: true,
            message: "Reset code sent to your email",
            resetCode: resetCode
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

        const decoded = jwt.verify(temporaryToken, process.env.JWT_SECRET_KEY);
        if (decoded.type !== "reset")
            throw new ApiError("Invalid temporary token type.", 401);

        const user = await User.findById(decoded.userId);
        if (!user)
            throw new ApiError("User not found.", 404);

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
        const { fullname, gender, height, weight, profilePicture, currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        
        if (!fullname && !gender && !height && !weight && !profilePicture && !currentPassword && !newPassword)
            throw new ApiError("At least one field (fullname, gender, height, weight, profilePicture, currentPassword, newPassword) is required.", 400);
        
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
        
        if (profilePicture)
            updateData.profilePicture = profilePicture;

        if (currentPassword && newPassword) {
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid)
                throw new ApiError("Current password is incorrect.", 401);

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
                profilePicture: updatedUser.profilePicture
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Profile update failed"
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

