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
import RoleHierarchy from './models/RoleHierarchy.js';  // Import the RoleHierarchy model
import Project from './models/projects.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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
    const { email, password , captchaToken  } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (captchaToken) {
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=6LfTUPQqAAAAANqECgSFKQ2FPaGmke6qTJwHeR3T&response=${captchaToken}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!data.success) {
        return res.status(400).json({ message: 'Invalid captcha token' });
      }
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

app.get('/api/user/profile',async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const token = authorization.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-password'); // Exclude password
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Extract first and last name if stored as single name field
    let firstName = user.firstName;
    let lastName = user.lastName;
    
    // Handle case where name is stored as single field
    if (!firstName && user.name) {
      const nameParts = user.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }
    
    // Return formatted user profile data
    res.json({
      firstName,
      lastName,
      email: user.email,
      age: user.age || 0,
      contact: user.contact || user.phone || '',
      role: user.role,
      location: user.location
    });
  }
  catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all events

// Get all events with location filter
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
app.get('/api/events/recent',async (req, res) => {
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

app.get('/api/projects/recent', auth,async (req, res) => {
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

const resetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Token expires after 1 hour
  },
});

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

// Configure nodemailer with appropriate transport
// For development, you can use ethereal.email for testing
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  }
});

// Request password reset (send email)
app.post('/api/reset-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "If an account with this email exists, a password reset link has been sent." });
    }
    
    // Delete any existing tokens for this user
    await ResetToken.deleteMany({ userId: user._id });
    
    // Create a random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);
    
    // Save token to database
    await new ResetToken({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();
    
    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    // Send email
    const mailOptions = {
      from: '"Eklavya Foundation" <support@eklavyafoundation.org>',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Reset Your Password</h1>
        <p>Hello ${user.firstName || user.name?.split(' ')[0] || ''},</p>
        <p>We received a request to reset your password for your Eklavya Foundation account.</p>
        <p>To reset your password, click on the button below:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link is valid for 1 hour.</p>
        <p>If you didn't request a password reset, you can ignore this email.</p>
        <p>Best regards,<br>Eklavya Foundation Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Always return success to prevent email enumeration
    res.status(200).json({ message: "If an account with this email exists, a password reset link has been sent." });
  } catch (error) {
    console.error('Error in password reset request:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Verify reset token
app.get('/api/reset-password/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find all tokens (we'll check them one by one)
    const resetTokens = await ResetToken.find({});
    
    // Check if token matches any stored token
    let validToken = null;
    for (const dbToken of resetTokens) {
      const isValid = await bcrypt.compare(token, dbToken.token);
      if (isValid) {
        validToken = dbToken;
        break;
      }
    }
    
    if (!validToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Reset password with token
app.post('/api/reset-password/reset/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Find all tokens (we'll check them one by one)
    const resetTokens = await ResetToken.find({});
    
    // Check if token matches any stored token
    let validToken = null;
    for (const dbToken of resetTokens) {
      const isValid = await bcrypt.compare(token, dbToken.token);
      if (isValid) {
        validToken = dbToken;
        break;
      }
    }
    
    if (!validToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user's password
    await User.findByIdAndUpdate(
      validToken.userId,
      { password: hashedPassword }
    );
    
    // Delete the used token
    await ResetToken.deleteOne({ _id: validToken._id });
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));