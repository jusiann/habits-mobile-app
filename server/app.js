import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import habitRoutes from './src/routes/habit.routes.js';
import {connectDB} from './src/lib/db.js';
import job from './src/utils/cron.js';

const PORT = process.env.PORT || 3000;
const app = express();

job.start();

// CORS middleware
app.use(cors({
    origin: '*', // Allow all origins for mobile app
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Global error handler to ensure JSON responses
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    connectDB();
});