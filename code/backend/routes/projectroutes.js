import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import auth from '../middleware/auth.js';
import Project from '../models/projects.js';
import express from 'express';
const projectrouter = express.Router();

projectrouter.get('/recent', auth,async (req, res) => {
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
  
  // Get all projects
  projectrouter.get('/', async (req, res) => {
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
  
      // Find projects where user is either a manager or team member
      const projects = await Project.find({
        $or: [
          { manager: user.name },
          { users: user.name }
        ]
      }).sort({ createdAt: -1 });
  
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  projectrouter.post('/create', auth, async (req, res) => {
    try {
      const { name, description, status, users, manager, startDate, endDate } = req.body;
      
      // Basic validation
      if (!name || !description || !status || !users || !manager || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Get the user who is creating the project
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if user has admin privileges
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized to create projects' });
      }
  
      // Create new project
      const newProject = new Project({
        name,
        description,
        status,
        users,
        manager,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        // createdAt will use the default value (current time)
      });
      
      console.log('New project:', newProject, 'saving...');
      
      // Save the project to the database
      await newProject.save();
      console.log('Project saved successfully');
      
      res.status(201).json({ 
        message: 'Project created successfully', 
        project: newProject 
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  });

export default projectrouter;