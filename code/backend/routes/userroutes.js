import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import auth from '../middleware/auth.js';
import crypto from 'crypto';
const userrouter = express.Router();
import transporter from '../utils/email.js'; // Import the transporter

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'foundationeklavya1@gmail.com',
//     pass: 'ewmy guwx keia ptqg  ',
//   }
// });


userrouter.put("/profile", auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { name, email, age, contact, location } = req.body;
      user.name = name;
      user.email = email;
      user.age = age;
      user.contact = contact;
      user.location = location;
      await user.save();
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
  );

userrouter.post('/login', async (req, res) => {
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

userrouter.get('/profile',async (req, res) => {
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

userrouter.post('/register-user', auth, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.userId);
    // Allow if the user's role is either 'admin' or 'superadmin'
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'superadmin')) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { name, email, role, age, project, parent_role, contact, location } = req.body;
    
    // Check if a user with the given email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }
    
    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString('hex'); // 16-character random password
    
    // Hash the random password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);
    
    // Create a new user
    const newUser = new User({
      name,
      email,
      role,
      age,
      project,       // Assuming project is sent as an array
      parent_role,   // Assuming parent_role is sent as an array
      contact,
      location,
      password: hashedPassword // Save the hashed password
    });
    await newUser.save();

    // Send an email with the random password and login link
    const loginUrl = 'http://localhost:5173/login'; // Replace with your actual login page URL
    const mailOptions = {
      from: 'foundationeklavya1@gmail.com',
      to: email,
      subject: 'Welcome to Eklavya Foundation - Your Account Details',
      html: `
        <h1>Welcome to Eklavya Foundation</h1>
        <p>Hello ${name},</p>
        <p>Your account has been created successfully. Below are your login details:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${randomPassword}</p>
        <p>Please log in and change your password as soon as possible.</p>
        <p>You can log in using the following link:</p>
        <a href="${loginUrl}" style="color: #3b82f6; text-decoration: none; font-weight: bold;">Go to Login Page</a>
        <p>Best regards,<br>Eklavya Foundation Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User registered successfully and email sent' });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default userrouter;




