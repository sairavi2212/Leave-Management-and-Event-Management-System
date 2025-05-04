import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import eventsrouter from './routes/eventroutes.js';
import userrouter from './routes/userroutes.js';
import projectrouter from './routes/projectroutes.js';
import passwordrouter from './routes/passwordroutes.js';
import leaverouter from './routes/leaveroutes.js';
import locationrouter from './routes/locationroutes.js';
import connectDB from './utils/db.js';
import { fileURLToPath } from 'url'; // Add this import
import path from 'path'; // Make sure path is imported


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/user', userrouter); // User-related routes
app.use('/api/leaves', leaverouter); // Leave-related routes
app.use('/api/events', eventsrouter); // Event-related routes
app.use('/api/projects', projectrouter); // Project-related routes
app.use('/api/reset-password', passwordrouter);
app.use('/api/locations', locationrouter);   

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
