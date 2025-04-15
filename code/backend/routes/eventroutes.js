import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import auth from '../middleware/auth.js';
import Event from '../models/events.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
const eventsrouter = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Set uploads directory to the correct path (backend/uploads instead of routes/uploads)
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Note: The line below should be in server.js, not in the router file

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
})

const upload = multer({ storage: storage });


eventsrouter.get('/',auth, async (req, res) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
  
        const token = authorization.replace('Bearer ', '');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.userId);
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const events = await Event.find({
            locations: { $in: [user.location] }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
  });
  
  
  // Get recent events with location filter
  eventsrouter.get('/recent',auth,async (req, res) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
  
        const token = authorization.replace('Bearer ', '');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.userId);
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        const recentEvents = await Event.find({
            locations: { $in: [user.location] }
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title description start end');
  
        res.json(recentEvents);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
  });

  
  eventsrouter.post('/create-event', auth, upload.single('eventImage'), async (req, res) => {
    try {
      // Get data from request body (now form-data format)
      const { title, description, start, end, selected_dropdown } = req.body;
      
      // Parse JSON strings for arrays
      const locations = req.body.locations ? JSON.parse(req.body.locations) : [];
      const projects = req.body.projects ? JSON.parse(req.body.projects) : [];
      
      // Basic validation
      if (!title || !description || !start || !end) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Get the user who is creating the event
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get image path if file was uploaded
      let image_path = null;
      if (req.file) {
        image_path = `/uploads/${req.file.filename}`;
      }
  
      // Create new event
      const newEvent = new Event({
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        comments: [], // Initialize with empty comments array
        selected_dropdown: selected_dropdown || 'General', // Default if not provided
        image_path: image_path, // Store path instead of blob
        locations: locations.length > 0 ? locations : [user.location], // Default to user's location if not specified
        projects: projects || [],
        // createdAt will use the default value (current time)
      });
      
      console.log('New event:', newEvent, 'saving...');
      
      // Save the event to the database
      await newEvent.save();
      console.log('Event saved successfully');
      
      res.status(201).json({ 
        message: 'Event created successfully', 
        event: newEvent 
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });
//export by default the router
export default eventsrouter;

