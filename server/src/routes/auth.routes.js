import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
    signIn, 
    signUp,
    refreshToken,
    checkResetToken,
    forgotPassword,
    changePassword,
    updateProfile,
    logout
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/check-reset-token', checkResetToken);
router.post('/change-password', changePassword);

router.post('/edit-profile', verifyToken, updateProfile);
router.post('/logout', verifyToken, logout);

export default router; 