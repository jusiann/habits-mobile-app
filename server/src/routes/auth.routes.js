import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
    signIn, 
    signUp,
    refreshToken,
    checkResetToken,
    forgotPassword,
    changePassword,
    changePasswordAuth,
    editProfile,
    logout
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/check-reset-token', checkResetToken);
router.post('/change-password', changePassword);

router.post('/change-password-auth', verifyToken, changePasswordAuth);
router.post('/edit-profile', verifyToken, editProfile);
router.post('/logout', verifyToken, logout);

export default router; 