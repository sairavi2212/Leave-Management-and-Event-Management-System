import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import auth from '../middleware/auth.js';
import Leave from '../models/leaves.js';  // Import the Leave model
import express from 'express';
const leaverouter = express.Router();
import transporter from '../utils/email.js'; // Import the transporter

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'foundationeklavya1@gmail.com',
//     pass: 'ewmy guwx keia ptqg  ',
//   }
// });



leaverouter.post('/', auth, async (req, res) => {
    try {
      const { leaveType, startDate, endDate, reason } = req.body;
  
      // Get the user submitting the leave request
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
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
  
      // Send email to the parent of the user
      if (user.parent_role && user.parent_role.length > 0) {
        const parentEmail = user.parent_role[0]; // Assuming the first parent role contains the email
        const mailOptions = {
          from: 'foundationeklavya1@gmail.com',
          to: parentEmail,
          subject: `Leave Request Submitted by ${user.name}`,
          html: `
            <h1>Leave Request Notification</h1>
            <p>Hello,</p>
            <p>${user.name} has submitted a leave request with the following details:</p>
            <p><strong>Leave Type:</strong> ${leaveType}</p>
            <p><strong>Start Date:</strong> ${startDate}</p>
            <p><strong>End Date:</strong> ${endDate}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>Please log in to the system to review and take action on this request.</p>
            <p>Best regards,<br>Eklavya Foundation Team</p>
          `
        };
  
        await transporter.sendMail(mailOptions);
      }
  
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
  leaverouter.get('/', auth, async (req, res) => {
    try {
      const leaves = await Leave.find({ userId: req.user.userId }).sort({ submittedAt: -1 });
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
    }
  });
  
  leaverouter.get('/all', auth, async (req, res) => {
    try {
      // First check if user is admin or superadmin
      const user = await User.findById(req.user.userId);
      if (user.role !== 'admin' && user.role !== 'superadmin') {
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
  
  
  leaverouter.get('/subordinate', auth, async (req, res) => {
    try {
      // First check if user is admin or superadmin
      const user = await User.findById(req.user.userId);
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // first get the current user email id
      // now go through all the leave requests by the user and check if the user's(who submitted the leave request) parent role field contains the current user's email id
      const leaves = await Leave.find()
        .populate('userId', 'name email parent_role')
        .sort({ submittedAt: -1 });
      const subordinateLeaves = leaves.filter(leave => {
        return user.email === leave.userId.parent_role[0];
      }
      );
      res.json(subordinateLeaves);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
    }
  });
  
  // Update leave request status (approve/reject)
  leaverouter.put('/:id', auth, async (req, res) => {
    try {
      // First check if user is admin or superadmin
      const user = await User.findById(req.user.userId);
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized to update leave status' });
      }
  
      const { status, comments } = req.body;
      if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      const leave = await Leave.findById(req.params.id).populate('userId', 'name email');
      if (!leave) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
  
      leave.status = status;
      leave.comments = comments || '';
      leave.approvedBy = req.user.userId;
      leave.approvedAt = new Date();
  
      await leave.save();
  
      // Send email to the user whose leave request was updated
      const mailOptions = {
        from: 'foundationeklavya1@gmail.com',
        to: leave.userId.email,
        subject: `Your Leave Request has been ${status}`,
        html: `
          <h1>Leave Request Update</h1>
          <p>Hello ${leave.userId.name},</p>
          <p>Your leave request has been <strong>${status}</strong>.</p>
          <p><strong>Comments:</strong> ${comments || 'No additional comments'}</p>
          <p>Best regards,<br>Eklavya Foundation Team</p>
        `
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: `Leave request ${status}`, leave });
    } catch (error) {
      console.error('Error updating leave request:', error);
      res.status(500).json({ message: 'Failed to update leave request', error: error.message });
    }
  });
  // Delete a leave request (only if it's pending and belongs to the user)
  leaverouter.delete('/:id', auth, async (req, res) => {
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
  
      // Fetch the user who submitted the leave request
      const leaveUser = await User.findById(leave.userId);
  
      // Delete the leave request
      await Leave.findByIdAndDelete(req.params.id);
  
      // Send email to the user whose leave request was deleted
      const mailOptions = {
        from: 'foundationeklavya1@gmail.com',
        to: leaveUser.email,
        subject: 'Your Leave Request has been Deleted',
        html: `
          <h1>Leave Request Deleted</h1>
          <p>Hello ${leaveUser.name},</p>
          <p>Your leave request has been deleted. Below are the details of the deleted request:</p>
          <p><strong>Leave Type:</strong> ${leave.leaveType}</p>
          <p><strong>Start Date:</strong> ${leave.startDate.toDateString()}</p>
          <p><strong>End Date:</strong> ${leave.endDate.toDateString()}</p>
          <p><strong>Reason:</strong> ${leave.reason}</p>
          <p>If you have any questions, please contact the administrator.</p>
          <p>Best regards,<br>Eklavya Foundation Team</p>
        `
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'Leave request deleted successfully and email sent' });
    } catch (error) {
      console.error('Error deleting leave request:', error);
      res.status(500).json({ message: 'Failed to delete leave request', error: error.message });
    }
  });

  leaverouter.get('/report', auth, async (req, res) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
  
        const token = authorization.replace('Bearer ', '');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.userId);
        if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const { month, year } = req.query;
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0);
        // now group all the leaves whose start date and end date is within the given month and then group them by the userId and then group them by leave type and then sum the duration
        const report = {}
        const location_user = user.location;
        const all_leaves = await Leave.find({
            startDate: { $gte: startDate },
            endDate: { $lte: endDate },
            status: 'approved'
        });
  
        // take only those leaves which are submitted by users of the same location as the admin
  
        if(user.role == 'admin'){ 
          const filtered_leaves = all_leaves.filter(leave => {
              return leave.userId.location === location_user ;
          });
          console.log(filtered_leaves);
          for (const leave of filtered_leaves){
              if (!report[leave.userId]){
                  report[leave.userId] = {}
              }
              if (!report[leave.userId][leave.leaveType]){
                  report[leave.userId][leave.leaveType] = 0
              }
              report[leave.userId][leave.leaveType] += leave.duration
          }
          const final_report = {}
          // in final report instead of userId just keep the user name by fetching it from the user collection
          for (const userId in report){
              const user = await User.findById(userId);
              final_report[user.name] = report[userId]
          }
          res.json(final_report);
        }
        else if(user.role == 'superadmin'){
          console.log("hii");
          for (const leave of all_leaves){
            if (!report[leave.userId]){
                report[leave.userId] = {}
            }
            if (!report[leave.userId][leave.leaveType]){
                report[leave.userId][leave.leaveType] = 0
            }
            report[leave.userId][leave.leaveType] += leave.duration
          }
          const final_report = {}
          // in final report instead of userId just keep the user name by fetching it from the user collection
          for (const userId in report){
              const user = await User.findById(userId);
              final_report[user.name] = report[userId]
          }
          res.json(final_report);
        }
  
    } catch (error) {
        console.error('Error generating leave report:', error);
        res.status(500).json({ message: 'Error generating leave report' });
    }
  });

export default leaverouter;
