import express from 'express';
import {
    addHabit,
    detailHabit,
    updateHabit,
    deleteHabit,
    getIncrementHabit,
    getHabitProgress,
    getDashboard,
    getHabitLogs,
    getHabitLogsByDate,
    getHabitPresets,
    getHabitPresetsByCategory
} from '../controllers/habit.controller.js';
import { verifyToken } from '../middlewares/auth.js';
const router = express.Router();


router.use(verifyToken);

router.get('/presets', verifyToken, getHabitPresets);
router.get('/presets/:category', verifyToken, getHabitPresetsByCategory);

router.get('/dashboard', verifyToken, getDashboard);

router.post('/add', verifyToken, addHabit);
router.get('/:id', verifyToken, detailHabit);
router.patch('/:id', verifyToken, updateHabit);
router.delete('/:id', verifyToken, deleteHabit);

router.post('/:id/increment', getIncrementHabit);
router.get('/:id/progress', getHabitProgress);

router.get('/:id/logs', getHabitLogs);
router.get('/:id/logs/:date', getHabitLogsByDate);

export default router;