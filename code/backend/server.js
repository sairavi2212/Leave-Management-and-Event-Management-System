import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import eventsrouter from './routes/eventroutes.js';
import userrouter from './routes/userroutes.js';
import projectrouter from './routes/projectroutes.js';
import passwordrouter from './routes/passwordroutes.js';
import leaverouter from './routes/leaveroutes.js';
import connectDB from './utils/db.js';


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

connectDB();

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


// // Login Route
// app.post('/api/login', async (req, res) => {
//   try {
//     const { email, password , captchaToken  } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }
//     if (captchaToken) {
//       const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=6LfTUPQqAAAAANqECgSFKQ2FPaGmke6qTJwHeR3T&response=${captchaToken}`, {
//         method: 'POST'
//       });
//       const data = await response.json();
//       if (!data.success) {
//         return res.status(400).json({ message: 'Invalid captcha token' });
//       }
//     }
//     const token = jwt.sign(
//       { userId: user.id },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.json({ 
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// app.get('/api/user/profile',async (req, res) => {
//   const { authorization } = req.headers;
//   if (!authorization) {
//     return res.status(401).json({ message: 'Not authenticated' });
//   }
//   try {
//     const token = authorization.replace('Bearer ', '');
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(payload.userId).select('-password'); // Exclude password
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // Extract first and last name if stored as single name field
//     let firstName = user.firstName;
//     let lastName = user.lastName;
    
//     // Handle case where name is stored as single field
//     if (!firstName && user.name) {
//       const nameParts = user.name.split(' ');
//       firstName = nameParts[0] || '';
//       lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
//     }
    
//     // Return formatted user profile data
//     res.json({
//       firstName,
//       lastName,
//       email: user.email,
//       age: user.age || 0,
//       contact: user.contact || user.phone || '',
//       role: user.role,
//       location: user.location
//     });
//   }
//   catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// // Get all events

// // Get all events with location filter
// app.get('/api/events', async (req, res) => {
//   try {
//       const { authorization } = req.headers;
//       if (!authorization) {
//           return res.status(401).json({ message: 'Not authenticated' });
//       }

//       const token = authorization.replace('Bearer ', '');
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(payload.userId);

//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }
//       const events = await Event.find({
//           locations: { $in: [user.location] }
//       });
//       res.json(events);
//   } catch (error) {
//       res.status(500).json({ message: 'Server Error' });
//   }
// });


// // Get recent events with location filter
// app.get('/api/events/recent',async (req, res) => {
//   try {
//       const { authorization } = req.headers;
//       if (!authorization) {
//           return res.status(401).json({ message: 'Not authenticated' });
//       }

//       const token = authorization.replace('Bearer ', '');
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(payload.userId);

//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       const recentEvents = await Event.find({
//           locations: { $in: [user.location] }
//       })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select('title description start end');

//       res.json(recentEvents);
//   } catch (error) {
//       res.status(500).json({ message: 'Server Error' });
//   }
// });

// app.get('/api/projects/recent', auth,async (req, res) => {
//   try {
//       const { authorization } = req.headers;
//       if (!authorization) {
//           return res.status(401).json({ message: 'Not authenticated' });
//       }

//       const token = authorization.replace('Bearer ', '');
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(payload.userId);

//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }
//       const recentProjects = await Project.find({
//           $or: [
//               { manager: user.name },
//               { users: user.name }
//           ]
//       })
//       .sort({ createdAt: -1 })
//       .limit(3)
//       .select('name description startDate endDate');
//       res.json(recentProjects);
//   } catch (error) {
//       console.error('Error fetching recent projects:', error);
//       res.status(500).json({ message: 'Server Error' });
//   }
// });

// // Get all projects
// app.get('/api/projects', async (req, res) => {
//   try {
//     const { authorization } = req.headers;
//     if (!authorization) {
//       return res.status(401).json({ message: 'Not authenticated' });
//     }

//     const token = authorization.replace('Bearer ', '');
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(payload.userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Find projects where user is either a manager or team member
//     const projects = await Project.find({
//       $or: [
//         { manager: user.name },
//         { users: user.name }
//       ]
//     }).sort({ createdAt: -1 });

//     res.json(projects);
//   } catch (error) {
//     console.error('Error fetching projects:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// app.post('/api/projects/create', auth, async (req, res) => {
//   try {
//     const { name, description, status, users, manager, startDate, endDate } = req.body;
    
//     // Basic validation
//     if (!name || !description || !status || !users || !manager || !startDate || !endDate) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     // Get the user who is creating the project
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check if user has admin privileges
//     if (user.role !== 'admin' && user.role !== 'superadmin') {
//       return res.status(403).json({ message: 'Not authorized to create projects' });
//     }

//     // Create new project
//     const newProject = new Project({
//       name,
//       description,
//       status,
//       users,
//       manager,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       // createdAt will use the default value (current time)
//     });
    
//     console.log('New project:', newProject, 'saving...');
    
//     // Save the project to the database
//     await newProject.save();
//     console.log('Project saved successfully');
    
//     res.status(201).json({ 
//       message: 'Project created successfully', 
//       project: newProject 
//     });
//   } catch (error) {
//     console.error('Error creating project:', error);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// });

// // Leave Management Routes

// // Submit a leave request
// app.post('/api/leaves', auth, async (req, res) => {
//   try {
//     const { leaveType, startDate, endDate, reason } = req.body;

//     // Get the user submitting the leave request
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Create new leave request
//     const leave = new Leave({
//       userId: req.user.userId,
//       leaveType,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       reason,
//       status: 'pending',
//       submittedAt: new Date()
//     });

//     await leave.save();

//     // Send email to the parent of the user
//     if (user.parent_role && user.parent_role.length > 0) {
//       const parentEmail = user.parent_role[0]; // Assuming the first parent role contains the email
//       const mailOptions = {
//         from: 'foundationeklavya1@gmail.com',
//         to: parentEmail,
//         subject: `Leave Request Submitted by ${user.name}`,
//         html: `
//           <h1>Leave Request Notification</h1>
//           <p>Hello,</p>
//           <p>${user.name} has submitted a leave request with the following details:</p>
//           <p><strong>Leave Type:</strong> ${leaveType}</p>
//           <p><strong>Start Date:</strong> ${startDate}</p>
//           <p><strong>End Date:</strong> ${endDate}</p>
//           <p><strong>Reason:</strong> ${reason}</p>
//           <p>Please log in to the system to review and take action on this request.</p>
//           <p>Best regards,<br>Eklavya Foundation Team</p>
//         `
//       };

//       await transporter.sendMail(mailOptions);
//     }

//     res.status(201).json({
//       message: 'Leave request submitted successfully',
//       leave
//     });
//   } catch (error) {
//     console.error('Error submitting leave request:', error);
//     res.status(500).json({ message: 'Failed to submit leave request', error: error.message });
//   }
// });

// // Get all leave requests for the logged-in user
// app.get('/api/leaves', auth, async (req, res) => {
//   try {
//     const leaves = await Leave.find({ userId: req.user.userId }).sort({ submittedAt: -1 });
//     res.json(leaves);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
//   }
// });

// app.get('/api/leaves/all', auth, async (req, res) => {
//   try {
//     // First check if user is admin or superadmin
//     const user = await User.findById(req.user.userId);
//     if (user.role !== 'admin' && user.role !== 'superadmin') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }
    
//     const leaves = await Leave.find()
//       .populate('userId', 'name email')
//       .sort({ submittedAt: -1 });
    
//     res.json(leaves);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
//   }
// });


// app.get('/api/leaves/subordinate', auth, async (req, res) => {
//   try {
//     // First check if user is admin or superadmin
//     const user = await User.findById(req.user.userId);
//     if (user.role !== 'admin' && user.role !== 'superadmin') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }
    
//     // first get the current user email id
//     // now go through all the leave requests by the user and check if the user's(who submitted the leave request) parent role field contains the current user's email id
//     const leaves = await Leave.find()
//       .populate('userId', 'name email parent_role')
//       .sort({ submittedAt: -1 });
//     const subordinateLeaves = leaves.filter(leave => {
//       return user.email === leave.userId.parent_role[0];
//     }
//     );
//     res.json(subordinateLeaves);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
//   }
// });

// // Update leave request status (approve/reject)
// app.put('/api/leaves/:id', auth, async (req, res) => {
//   try {
//     // First check if user is admin or superadmin
//     const user = await User.findById(req.user.userId);
//     if (user.role !== 'admin' && user.role !== 'superadmin') {
//       return res.status(403).json({ message: 'Not authorized to update leave status' });
//     }

//     const { status, comments } = req.body;
//     if (status !== 'approved' && status !== 'rejected') {
//       return res.status(400).json({ message: 'Invalid status value' });
//     }

//     const leave = await Leave.findById(req.params.id).populate('userId', 'name email');
//     if (!leave) {
//       return res.status(404).json({ message: 'Leave request not found' });
//     }

//     leave.status = status;
//     leave.comments = comments || '';
//     leave.approvedBy = req.user.userId;
//     leave.approvedAt = new Date();

//     await leave.save();

//     // Send email to the user whose leave request was updated
//     const mailOptions = {
//       from: 'foundationeklavya1@gmail.com',
//       to: leave.userId.email,
//       subject: `Your Leave Request has been ${status}`,
//       html: `
//         <h1>Leave Request Update</h1>
//         <p>Hello ${leave.userId.name},</p>
//         <p>Your leave request has been <strong>${status}</strong>.</p>
//         <p><strong>Comments:</strong> ${comments || 'No additional comments'}</p>
//         <p>Best regards,<br>Eklavya Foundation Team</p>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ message: `Leave request ${status}`, leave });
//   } catch (error) {
//     console.error('Error updating leave request:', error);
//     res.status(500).json({ message: 'Failed to update leave request', error: error.message });
//   }
// });
// // Delete a leave request (only if it's pending and belongs to the user)
// app.delete('/api/leaves/:id', auth, async (req, res) => {
//   try {
//     const leave = await Leave.findById(req.params.id);

//     if (!leave) {
//       return res.status(404).json({ message: 'Leave request not found' });
//     }

//     // Check if the leave belongs to the requesting user or the user is admin
//     const user = await User.findById(req.user.userId);

//     if (leave.userId.toString() !== req.user.userId && user.role !== 'admin') {
//       return res.status(403).json({ message: 'Not authorized to delete this leave request' });
//     }

//     // Only allow deletion of pending leaves
//     if (leave.status !== 'pending' && user.role !== 'admin') {
//       return res.status(400).json({ message: 'Cannot delete a leave request that has been processed' });
//     }

//     // Fetch the user who submitted the leave request
//     const leaveUser = await User.findById(leave.userId);

//     // Delete the leave request
//     await Leave.findByIdAndDelete(req.params.id);

//     // Send email to the user whose leave request was deleted
//     const mailOptions = {
//       from: 'foundationeklavya1@gmail.com',
//       to: leaveUser.email,
//       subject: 'Your Leave Request has been Deleted',
//       html: `
//         <h1>Leave Request Deleted</h1>
//         <p>Hello ${leaveUser.name},</p>
//         <p>Your leave request has been deleted. Below are the details of the deleted request:</p>
//         <p><strong>Leave Type:</strong> ${leave.leaveType}</p>
//         <p><strong>Start Date:</strong> ${leave.startDate.toDateString()}</p>
//         <p><strong>End Date:</strong> ${leave.endDate.toDateString()}</p>
//         <p><strong>Reason:</strong> ${leave.reason}</p>
//         <p>If you have any questions, please contact the administrator.</p>
//         <p>Best regards,<br>Eklavya Foundation Team</p>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ message: 'Leave request deleted successfully and email sent' });
//   } catch (error) {
//     console.error('Error deleting leave request:', error);
//     res.status(500).json({ message: 'Failed to delete leave request', error: error.message });
//   }
// });

// // Protected Route Example
// app.get('/api/protected', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select('-password');
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// app.post('/api/roles/hierarchy', async (req, res) => {
//   try {
//       const { authorization } = req.headers;
//       if (!authorization) {
//           return res.status(401).json({ message: 'Not authenticated' });
//       }

//       const token = authorization.replace('Bearer ', '');
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(payload.userId);

//       if (!user || user.role !== 'admin') {
//           return res.status(403).json({ message: 'Not authorized' });
//       }

//       const { role, parentRole, childRole, level } = req.body;
      
//       // Create new role
//       const newRole = new RoleHierarchy({
//           role,
//           parentRole,
//           childRole,
//           level
//       });

//       await newRole.save();

//       // Update child levels
//       if (childRole) {
//           await updateChildLevels(role, level);
//       }

//       res.status(201).json(newRole);
//   } catch (error) {
//       res.status(500).json({ message: 'Server Error' });
//   }
// });

// app.get('/api/roles/hierarchy', async (req, res) => {
//   try {
//       const roles = await RoleHierarchy.find().sort('level');
//       res.json(roles);
//   } catch (error) {
//       res.status(500).json({ message: 'Server Error' });
//   }
// });

// async function updateChildLevels(parentRole, parentLevel) {
//   const children = await RoleHierarchy.find({ parentRole });
//   for (const child of children) {
//       await RoleHierarchy.findByIdAndUpdate(
//           child._id,
//           { level: parentLevel + 1 },
//           { new: true }
//       );
//       await updateChildLevels(child.role, parentLevel + 1);
//   }
// }

// app.get('/api/leaves/report', auth, async (req, res) => {
//   try {
//       const { authorization } = req.headers;
//       if (!authorization) {
//           return res.status(401).json({ message: 'Not authenticated' });
//       }

//       const token = authorization.replace('Bearer ', '');
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(payload.userId);
//       if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
//           return res.status(403).json({ message: 'Not authorized' });
//       }
//       const { month, year } = req.query;
//       const monthNum = parseInt(month);
//       const yearNum = parseInt(year);
      
//       const startDate = new Date(yearNum, monthNum - 1, 1);
//       const endDate = new Date(yearNum, monthNum, 0);
//       // now group all the leaves whose start date and end date is within the given month and then group them by the userId and then group them by leave type and then sum the duration
//       const report = {}
//       const location_user = user.location;
//       const all_leaves = await Leave.find({
//           startDate: { $gte: startDate },
//           endDate: { $lte: endDate },
//           status: 'approved'
//       });

//       // take only those leaves which are submitted by users of the same location as the admin

//       if(user.role == 'admin'){ 
//         const filtered_leaves = all_leaves.filter(leave => {
//             return leave.userId.location === location_user ;
//         });
//         console.log(filtered_leaves);
//         for (const leave of filtered_leaves){
//             if (!report[leave.userId]){
//                 report[leave.userId] = {}
//             }
//             if (!report[leave.userId][leave.leaveType]){
//                 report[leave.userId][leave.leaveType] = 0
//             }
//             report[leave.userId][leave.leaveType] += leave.duration
//         }
//         const final_report = {}
//         // in final report instead of userId just keep the user name by fetching it from the user collection
//         for (const userId in report){
//             const user = await User.findById(userId);
//             final_report[user.name] = report[userId]
//         }
//         res.json(final_report);
//       }
//       else if(user.role == 'superadmin'){
//         console.log("hii");
//         for (const leave of all_leaves){
//           if (!report[leave.userId]){
//               report[leave.userId] = {}
//           }
//           if (!report[leave.userId][leave.leaveType]){
//               report[leave.userId][leave.leaveType] = 0
//           }
//           report[leave.userId][leave.leaveType] += leave.duration
//         }
//         const final_report = {}
//         // in final report instead of userId just keep the user name by fetching it from the user collection
//         for (const userId in report){
//             const user = await User.findById(userId);
//             final_report[user.name] = report[userId]
//         }
//         res.json(final_report);
//       }

//   } catch (error) {
//       console.error('Error generating leave report:', error);
//       res.status(500).json({ message: 'Error generating leave report' });
//   }
// });

// // const resetTokenSchema = new mongoose.Schema({
// //   userId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     required: true,
// //     ref: 'User',
// //   },
// //   token: {
// //     type: String,
// //     required: true,
// //   },
// //   createdAt: {
// //     type: Date,
// //     default: Date.now,
// //     expires: 3600, // Token expires after 1 hour
// //   },
// // });

// // const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

// // Configure nodemailer with appropriate transport
// // For development, you can use ethereal.email for testing
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'foundationeklavya1@gmail.com',
//     pass: 'ewmy guwx keia ptqg  ',
//   }
// });

// // Request password reset (send email)
// app.post('/api/reset-password/request', async (req, res) => {
//   try {
//     const { email } = req.body;
//     console.log(email, "email");

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "If an account with this email exists, a password reset link has been sent." });
//     }

//     // Delete any existing tokens for this user
//     await ResetToken.deleteMany({ userId: user._id });

//     // Create a random token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const hash = await bcrypt.hash(resetToken, 10);

//     // Save token to database
//     await new ResetToken({
//       userId: user._id,
//       token: hash,
//       createdAt: Date.now(),
//     }).save();

//     // Create reset URL
//     const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

//     // Send email
//     const mailOptions = {
//       from: 'foundationeklavya1@gmail.com',
//       to: user.email,
//       subject: 'Password Reset Request',
//       html: `
//   <h1>Reset Your Password</h1>
//   <p>Hello ${user.firstName || user.name?.split(' ')[0] || ''},</p>
//   <p>We received a request to reset your password for your Eklavya Foundation account.</p>
//   <p>To reset your password, click on the button below:</p>
  
//   <!-- Styled button -->
//   <table width="100%" border="0" cellspacing="0" cellpadding="0">
//     <tr>
//       <td>
//         <table border="0" cellspacing="0" cellpadding="0">
//           <tr>
//             <td align="center" style="border-radius: 5px;" bgcolor="#3b82f6">
//               <a href="${resetUrl}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block; font-weight: bold;">
//                 Reset Password
//               </a>
//             </td>
//           </tr>
//         </table>
//       </td>
//     </tr>
//   </table>
  
//   <p>This link is valid for 1 hour.</p>
//   <p>If you didn't request a password reset, you can ignore this email.</p>
//   <p>Best regards,<br>Eklavya Foundation Team</p>
// `
//     };

//     await transporter.sendMail(mailOptions);

//     // Always return success to prevent email enumeration
//     res.status(200).json({ message: "If an account with this email exists, a password reset link has been sent." });
//   } catch (error) {
//     console.error('Error in password reset request:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// // Verify reset token
// app.get('/api/reset-password/verify/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
    
//     // Find all tokens (we'll check them one by one)
//     const resetTokens = await ResetToken.find({});
    
//     // Check if token matches any stored token
//     let validToken = null;
//     for (const dbToken of resetTokens) {
//       const isValid = await bcrypt.compare(token, dbToken.token);
//       if (isValid) {
//         validToken = dbToken;
//         break;
//       }
//     }
    
//     if (!validToken) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }
    
//     res.status(200).json({ message: 'Token is valid' });
//   } catch (error) {
//     console.error('Error verifying token:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// // Reset password with token
// app.post('/api/reset-password/reset/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;
    
//     // Find all tokens (we'll check them one by one)
//     const resetTokens = await ResetToken.find({});
    
//     // Check if token matches any stored token
//     let validToken = null;
//     for (const dbToken of resetTokens) {
//       const isValid = await bcrypt.compare(token, dbToken.token);
//       if (isValid) {
//         validToken = dbToken;
//         break;
//       }
//     }
    
//     if (!validToken) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }
    
//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
    
//     // Update user's password
//     await User.findByIdAndUpdate(
//       validToken.userId,
//       { password: hashedPassword }
//     );
    
//     // Delete the used token
//     await ResetToken.deleteOne({ _id: validToken._id });
    
//     res.status(200).json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error('Error resetting password:', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });



// app.post('/api/register-user', auth, async (req, res) => {
//   try {
//     const adminUser = await User.findById(req.user.userId);
//     // Allow if the user's role is either 'admin' or 'superadmin'
//     if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'superadmin')) {
//       return res.status(403).json({ message: 'Not authorized' });
//     }
    
//     const { name, email, role, age, project, parent_role, contact, location } = req.body;
    
//     // Check if a user with the given email already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User with that email already exists' });
//     }
    
//     // Generate a random password
//     const randomPassword = crypto.randomBytes(8).toString('hex'); // 16-character random password
    
//     // Hash the random password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(randomPassword, salt);
    
//     // Create a new user
//     const newUser = new User({
//       name,
//       email,
//       role,
//       age,
//       project,       // Assuming project is sent as an array
//       parent_role,   // Assuming parent_role is sent as an array
//       contact,
//       location,
//       password: hashedPassword // Save the hashed password
//     });
//     await newUser.save();

//     // Send an email with the random password and login link
//     const loginUrl = 'http://localhost:5173/login'; // Replace with your actual login page URL
//     const mailOptions = {
//       from: 'foundationeklavya1@gmail.com',
//       to: email,
//       subject: 'Welcome to Eklavya Foundation - Your Account Details',
//       html: `
//         <h1>Welcome to Eklavya Foundation</h1>
//         <p>Hello ${name},</p>
//         <p>Your account has been created successfully. Below are your login details:</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Password:</strong> ${randomPassword}</p>
//         <p>Please log in and change your password as soon as possible.</p>
//         <p>You can log in using the following link:</p>
//         <a href="${loginUrl}" style="color: #3b82f6; text-decoration: none; font-weight: bold;">Go to Login Page</a>
//         <p>Best regards,<br>Eklavya Foundation Team</p>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({ message: 'User registered successfully and email sent' });
//   } catch (err) {
//     console.error("Error registering user:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // First Time Login Endpoint
// app.post('/api/first-time-login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // Check if the user already has a password set (non-empty)
//     if (user.password && user.password.trim() !== "") {
//       return res.status(400).json({ message: 'Password is already set for this account' });
//     }
    
//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
    
//     // Update the user's password
//     user.password = hashedPassword;
//     await user.save();
    
//     // Generate JWT token for the user
//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );
    
//     res.status(200).json({
//       message: 'Password set successfully',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (err) {
//     console.error("Error in first time login:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));