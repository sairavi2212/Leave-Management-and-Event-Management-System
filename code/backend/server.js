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

// MongoDB Connection
// const MONGODB_URI = 'mongodb+srv://Users:craak@cluster0.qdosc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// mongoose.connect(MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1); // Exit process with failure
//   });


// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const uploadsDir = path.join(__dirname, 'uploads');

// // Create uploads directory if it doesn't exist
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Make uploads directory accessible
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const storage =  multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
//   }
// })

// const upload = multer({ storage: storage });

// app.put("/api/user/profile", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const { name, email, age, contact, location } = req.body;
//     user.name = name;
//     user.email = email;
//     user.age = age;
//     user.contact = contact;
//     user.location = location;
//     await user.save();
//     res.json({ message: "Profile updated successfully" });
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// }
// );
// use the eventsrouter
app.use('/api/user', userrouter); // User-related routes
app.use('/api/leaves', leaverouter); // Leave-related routes
app.use('/api/events', eventsrouter); // Event-related routes
app.use('/api/projects', projectrouter); // Project-related routes
app.use('/api/reset-password', passwordrouter);
app.use('/api/locations', locationrouter);   

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
