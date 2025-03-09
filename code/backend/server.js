import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/users.js';
import auth from './middleware/auth.js';
import Event from './models/events.js';
import Leave from './models/leaves.js';  // Import the Leave model

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://Users:craak@cluster0.qdosc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  });

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/user/profile', async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const token = authorization.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const username = user.name;
    res.json({ username });
  }
  catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

<<<<<<< HEAD
// Get all events
=======

// Get all events with location filter
>>>>>>> 967be36 (add role hierarchy)
app.get('/api/events', async (req, res) => {
  try {
      const { authorization } = req.headers;
      console.log(authorization);
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
      console.log(events);
      console.log("hi");
      res.json(events);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});


// Get recent events with location filter
app.get('/api/events/recent', async (req, res) => {
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

app.get('/api/projects/recent', async (req, res) => {
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
      const recentProjects = await Project.find({
          $or: [
              { manager: user.name },
              { users: user.name }
          ]
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name description startDate endDate');
      res.json(recentProjects);
  } catch (error) {
      console.error('Error fetching recent projects:', error);
      res.status(500).json({ message: 'Server Error' });
  }
});

// Leave Management Routes

// Submit a leave request
app.post('/api/leaves', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    // Create new leave request
    const leave = new Leave({
      userId: req.user.userId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'pending',
      submittedAt: new Date()
    });
    
    await leave.save();
    res.status(201).json({ 
      message: 'Leave request submitted successfully', 
      leave 
    });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ message: 'Failed to submit leave request', error: error.message });
  }
});

// Get all leave requests for the logged-in user
app.get('/api/leaves', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.userId }).sort({ submittedAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
  }
});

// Get all leave requests (for managers/admin)
app.get('/api/leaves/all', auth, async (req, res) => {
  try {
    // First check if user is admin or manager
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const leaves = await Leave.find()
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
  }
});

// Update leave request status (approve/reject)
app.put('/api/leaves/:id', auth, async (req, res) => {
  try {
    // First check if user is admin or manager
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to update leave status' });
    }
    
    const { status, comments } = req.body;
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    leave.status = status;
    leave.comments = comments || '';
    leave.approvedBy = req.user.userId;
    leave.approvedAt = new Date();
    
    await leave.save();
    res.json({ message: `Leave request ${status}`, leave });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update leave request', error: error.message });
  }
});

// Delete a leave request (only if it's pending and belongs to the user)
app.delete('/api/leaves/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Check if the leave belongs to the requesting user or the user is admin
    const user = await User.findById(req.user.userId);
    
    if (leave.userId.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this leave request' });
    }
    
    // Only allow deletion of pending leaves
    if (leave.status !== 'pending' && user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete a leave request that has been processed' });
    }
    
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete leave request', error: error.message });
  }
});

// Protected Route Example
app.get('/api/protected', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add these routes to your existing server.js

app.post('/api/roles/hierarchy', async (req, res) => {
  try {
      const { authorization } = req.headers;
      if (!authorization) {
          return res.status(401).json({ message: 'Not authenticated' });
      }

      const token = authorization.replace('Bearer ', '');
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId);

      if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Not authorized' });
      }

      const { role, parentRole, childRole, level } = req.body;
      
      // Create new role
      const newRole = new RoleHierarchy({
          role,
          parentRole,
          childRole,
          level
      });

      await newRole.save();

      // Update child levels
      if (childRole) {
          await updateChildLevels(role, level);
      }

      res.status(201).json(newRole);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/roles/hierarchy', async (req, res) => {
  try {
      const roles = await RoleHierarchy.find().sort('level');
      res.json(roles);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

async function updateChildLevels(parentRole, parentLevel) {
  const children = await RoleHierarchy.find({ parentRole });
  for (const child of children) {
      await RoleHierarchy.findByIdAndUpdate(
          child._id,
          { level: parentLevel + 1 },
          { new: true }
      );
      await updateChildLevels(child.role, parentLevel + 1);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));