import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import auth from '../middleware/auth.js';
import Event from '../models/events.js';
import express from 'express';
const eventsrouter = express.Router();


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

  eventsrouter.post('/create-event', auth, async (req, res) => {
    try {
      var { title, description, start, end, image_blob, locations, projects, selected_dropdown } = req.body;
      
      // Basic validation
      if (!title || !description || !start || !end) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Get the user who is creating the event
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create new event with empty comments array
      const newEvent = new Event({
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        comments: [], // Initialize with empty comments array
        selected_dropdown: selected_dropdown || 'General', // Default if not provided
        image_blob: image_blob || 'No Image', // Default if not provided
        locations: locations || [user.location], // Default to user's location if not specified
        projects: projects || [],
        // createdAt will use the default value (current time)
      });
      
      console.log('New event:', newEvent, `saving...`);
      
  
      // Save the event to the database
      await newEvent.save();
      console.log(`saved.`)
      
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

