import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import habitRoutes from './src/routes/habit.routes.js';
import {connectDB} from './src/lib/db.js';
import job from './src/utils/cron.js';

const PORT = process.env.PORT || 3000;
const app = express();

job.start();

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});
app.use(limiter);

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
        console.log(`[LOG - ${time}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
        return originalSend.call(this, data);
    };
    next();
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);

app.get('/health', (req, res) => {
    const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    res.status(200).json({
        success: true,
        message: `[SERVER - ${time}] System is healthy`,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    console.log(`[SERVER - ${time}] Started on PORT ${PORT}`);
    connectDB();
});