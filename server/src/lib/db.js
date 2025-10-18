import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[DB - ${time}] Connected to ${conn.connection.host}`);
    } catch (error) {
        const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
        console.log(`[DB - ${time}] Connection failed: ${error.message}`);
        process.exit(1);
    }
}