import express from 'express';
import {
    addHabit,
    detailHabit,
    updateHabit,
    deleteHabit,
    getIncrementHabit,
    getHabitProgress,
    getDashboardHabits,
    getHabitLogsByDate,
    getMonthlyHabitLogs,
    getHabitPresets,
    getHabitPresetsByCategory,
    getDashboardGoals,
    createGoal,
    deleteGoal
} from '../controllers/habit.controller.js';

import { verifyToken } from '../middlewares/auth.js';
import { get } from 'mongoose';
const router = express.Router();


router.use(verifyToken);

router.get('/presets', verifyToken, getHabitPresets);
router.get('/presets/:category', verifyToken, getHabitPresetsByCategory);

router.get('/dashboard', verifyToken, getDashboardHabits);
router.get('/logs-by-date', getHabitLogsByDate);
router.get('/monthly/:year/:month', verifyToken, getMonthlyHabitLogs);

router.post('/add', verifyToken, addHabit);



router.get('/goals', verifyToken, getDashboardGoals);
router.post('/goals', verifyToken, createGoal);
router.delete('/goals/:id', verifyToken, deleteGoal);




router.get('/:id', verifyToken, detailHabit);
router.patch('/:id', verifyToken, updateHabit);
router.delete('/:id', verifyToken, deleteHabit);

router.post('/:id/increment', getIncrementHabit);
router.get('/:id/progress', getHabitProgress);

export default router;