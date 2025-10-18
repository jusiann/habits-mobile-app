import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const createToken = (user) => {
    const accessToken = jwt.sign({ 
        userId: user._id 
    }, process.env.JWT_SECRET_KEY, { 
        expiresIn: '15m' 
    });
    const refreshToken = jwt.sign({ 
        userId: user._id 
    }, process.env.JWT_REFRESH_SECRET_KEY, { 
        expiresIn: '7d' 
    });
    return {accessToken, refreshToken};
};

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ 
                success: false, 
                message: 'Access token is required' 
            });
        
        const accessToken = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.userId);
        if (!user) 
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError)
            return res.status(401).json({ 
                success: false, 
                message: 'Access token has expired' 
            });     

        return res.status(401).json({ 
            success: false, 
            message: 'Invalid access token' 
        });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(401).json({ 
                success: false, 
                message: 'Refresh token is required' 
            });
        
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
        const user = await User.findById(decoded.userId);  
        if (!user)
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '15m' }
        );

        return res.status(200).json({
            success: true,
            accessToken,
            message: 'New access token generated successfully',
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) 
            return res.status(401).json({ 
                success: false, 
                message: 'Refresh token has expired' 
            });
        
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid refresh token' 
        });
    }
};

