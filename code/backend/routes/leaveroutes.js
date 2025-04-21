import jwt from "jsonwebtoken";
import User from "../models/users.js";
import auth from "../middleware/auth.js";
import Leave from "../models/leaves.js"; // Import the Leave model
import express from "express";
const leaverouter = express.Router();
import transporter from "../utils/email.js"; // Import the transporter

const CASUAL_LEAVE_MONTH = 12;
const EARNED_LEAVE_MONTH = 12;
const SICK_LEAVE_MONTH = 12;

function differenceInMonths(dateA, dateB) {
  const yearDiff = dateA.getFullYear() - dateB.getFullYear();
  const monthDiff = dateA.getMonth() - dateB.getMonth();
  return yearDiff * 12 + monthDiff;
}

leaverouter.post("/", auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Get the user submitting the leave request
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate the duration of the leave request in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Determine if the leave should be auto-approved (2 days or less)
    const isShortLeave = durationInDays <= 2;
    const leaveStatus = isShortLeave ? "approved" : "pending";

    // Create new leave request
    const leave = new Leave({
      userId: req.user.userId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: leaveStatus,
      submittedAt: new Date(),
      // If auto-approved, set additional fields
      ...(isShortLeave && {
        approvedAt: new Date(),
        comments: "Auto-approved as duration is 2 days or less"
      })
    });

    await leave.save();

    // Send email to the parent of the user
    if (user.parent_role && user.parent_role.length > 0) {
      for (const parentEmail of user.parent_role) {
        const mailOptions = {
          from: "foundationeklavya1@gmail.com",
          to: parentEmail,
          subject: isShortLeave 
            ? `Notification: ${user.name} is on Leave (Auto-Approved)` 
            : `Leave Request Submitted by ${user.name}`,
          html: isShortLeave 
            ? `
              <h1>Leave Notification</h1>
              <p>Hello,</p>
              <p>${user.name} is on leave with the following details:</p>
              <p><strong>Leave Type:</strong> ${leaveType}</p>
              <p><strong>Start Date:</strong> ${startDate}</p>
              <p><strong>End Date:</strong> ${endDate}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Status:</strong> Automatically approved (duration ≤ 2 days)</p>
              <p>This is an auto-approved leave as per the policy for leaves of 2 days or less.</p>
              <p>Best regards,<br>Eklavya Foundation Team</p>
            `
            : `
              <h1>Leave Request Notification</h1>
              <p>Hello,</p>
              <p>${user.name} has submitted a leave request with the following details:</p>
              <p><strong>Leave Type:</strong> ${leaveType}</p>
              <p><strong>Start Date:</strong> ${startDate}</p>
              <p><strong>End Date:</strong> ${endDate}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p>Please log in to the system to review and take action on this request.</p>
              <p>Best regards,<br>Eklavya Foundation Team</p>
            `,
        };
        await transporter.sendMail(mailOptions);
      }
    }

    // If auto-approved, also send a confirmation email to the user
    if (isShortLeave) {
      const userMailOptions = {
        from: "foundationeklavya1@gmail.com",
        to: user.email,
        subject: "Your Leave Request has been Auto-Approved",
        html: `
          <h1>Leave Request Auto-Approved</h1>
          <p>Hello ${user.name},</p>
          <p>Your leave request has been <strong>automatically approved</strong> as it is for 2 days or less.</p>
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          <p><strong>End Date:</strong> ${endDate}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Best regards,<br>Eklavya Foundation Team</p>
        `,
      };
      await transporter.sendMail(userMailOptions);
    }

    res.status(201).json({
      message: isShortLeave 
        ? "Leave request automatically approved (duration ≤ 2 days)" 
        : "Leave request submitted successfully",
      leave,
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({
      message: "Failed to submit leave request",
      error: error.message,
    });
  }
});

// Get all leave requests for the logged-in user
leaverouter.get("/", auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.userId }).sort({
      submittedAt: -1,
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
});

leaverouter.get("/all", auth, async (req, res) => {
  try {
    // First check if user is admin or superadmin
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const leaves = await Leave.find()
      .populate("userId", "name email")
      .sort({ submittedAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
});

leaverouter.get("/subordinate", auth, async (req, res) => {
  try {
    // First check if user is admin or superadmin
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // first get the current user email id
    // now go through all the leave requests by the user and check if the user's(who submitted the leave request) parent role field contains the current user's email id
    const leaves = await Leave.find()
      .populate("userId", "name email parent_role")
      .sort({ submittedAt: -1 });
    const subordinateLeaves = leaves.filter((leave) => {
      return user.email === leave.userId.parent_role[0];
    });
    res.json(subordinateLeaves);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
});

// Update leave request status (approve/reject)
leaverouter.put("/:id", auth, async (req, res) => {
  try {
    // First check if user is admin or superadmin
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({
        message: "Not authorized to update leave status",
      });
    }

    const { status, comments } = req.body;
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const leave = await Leave.findById(req.params.id).populate(
      "userId",
      "name email",
    );
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    leave.comments = comments || "";
    leave.approvedBy = req.user.userId;
    leave.approvedAt = new Date();

    await leave.save();

    // Send email to the user whose leave request was updated
    const mailOptions = {
      from: "foundationeklavya1@gmail.com",
      to: leave.userId.email,
      subject: `Your Leave Request has been ${status}`,
      html: `
          <h1>Leave Request Update</h1>
          <p>Hello ${leave.userId.name},</p>
          <p>Your leave request has been <strong>${status}</strong>.</p>
          <p><strong>Comments:</strong> ${
        comments || "No additional comments"
      }</p>
          <p>Best regards,<br>Eklavya Foundation Team</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: `Leave request ${status}`, leave });
  } catch (error) {
    console.error("Error updating leave request:", error);
    res.status(500).json({
      message: "Failed to update leave request",
      error: error.message,
    });
  }
});
// Delete a leave request (only if it's pending and belongs to the user)
leaverouter.delete("/:id", auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check if the leave belongs to the requesting user or the user is admin
    const user = await User.findById(req.user.userId);

    if (leave.userId.toString() !== req.user.userId && user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to delete this leave request",
      });
    }

    // Only allow deletion of pending leaves
    if (leave.status !== "pending" && user.role !== "admin") {
      return res.status(400).json({
        message: "Cannot delete a leave request that has been processed",
      });
    }

    // Fetch the user who submitted the leave request
    const leaveUser = await User.findById(leave.userId);

    // Delete the leave request
    await Leave.findByIdAndDelete(req.params.id);

    // Send email to the user whose leave request was deleted
    const mailOptions = {
      from: "foundationeklavya1@gmail.com",
      to: leaveUser.email,
      subject: "Your Leave Request has been Deleted",
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
        `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Leave request deleted successfully and email sent" });
  } catch (error) {
    console.error("Error deleting leave request:", error);
    res.status(500).json({
      message: "Failed to delete leave request",
      error: error.message,
    });
  }
});

leaverouter.get("/report", auth, async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    // now group all the leaves whose start date and end date is within the given month and then group them by the userId and then group them by leave type and then sum the duration
    const report = {};
    const location_user = user.location;
    const all_leaves = await Leave.find({
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
      status: "approved",
    });

    // take only those leaves which are submitted by users of the same location as the admin

    if (user.role == "admin") {
      const filtered_leaves = all_leaves.filter((leave) => {
        return leave.userId.location === location_user;
      });
      console.log(filtered_leaves);
      for (const leave of filtered_leaves) {
        if (!report[leave.userId]) {
          report[leave.userId] = {};
        }
        if (!report[leave.userId][leave.leaveType]) {
          report[leave.userId][leave.leaveType] = 0;
        }
        report[leave.userId][leave.leaveType] += leave.duration;
      }
      const final_report = {};
      // in final report instead of userId just keep the user name by fetching it from the user collection
      for (const userId in report) {
        const user = await User.findById(userId);
        final_report[user.name] = report[userId];
      }
      res.json(final_report);
    } else if (user.role == "superadmin") {
      for (const leave of all_leaves) {
        if (!report[leave.userId]) {
          report[leave.userId] = {};
        }
        if (!report[leave.userId][leave.leaveType]) {
          report[leave.userId][leave.leaveType] = 0;
        }
        report[leave.userId][leave.leaveType] += leave.duration;
      }
      const final_report = {};
      // in final report instead of userId just keep the user name by fetching it from the user collection
      for (const userId in report) {
        const user = await User.findById(userId);
        final_report[user.name] = report[userId];
      }
      res.json(final_report);
    }
  } catch (error) {
    console.error("Error generating leave report:", error);
    res.status(500).json({ message: "Error generating leave report" });
  }
});

leaverouter.get("/balance", auth, async (req, res) => {
  try {
    // Get user info for registration date
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate months since registration
    const registrationDate = user.createdAt;
    const currentDate = new Date();
    const monthsSinceRegistration =
      differenceInMonths(currentDate, registrationDate) + 1; // Add 1 to include current month

    // Get all approved leave requests for this user
    const approvedLeaves = await Leave.find({
      userId: req.user.userId,
      status: "approved",
    });

    // Calculate used leaves by type
    const usedLeaves = {
      sick: 0,
      casual: 0,
      earned: 0,
    };

    approvedLeaves.forEach((leave) => {
      if (leave.leaveType in usedLeaves) {
        // Calculate duration including both start and end date
        const durationInDays =
          Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) +
          1;
        usedLeaves[leave.leaveType] += durationInDays;
      }
    });

    // Calculate allocated leaves based on months since registration
    const allocatedLeaves = {
      sick: monthsSinceRegistration * SICK_LEAVE_MONTH, // 1 sick leave per month
      casual: monthsSinceRegistration * CASUAL_LEAVE_MONTH, // 1 casual leave per month
      earned: monthsSinceRegistration * EARNED_LEAVE_MONTH, // 1 earned leave per month
    };

    // Calculate remaining leaves
    const remainingLeaves = {
      sick: Math.max(0, allocatedLeaves.sick - usedLeaves.sick),
      casual: Math.max(0, allocatedLeaves.casual - usedLeaves.casual),
      earned: Math.max(0, allocatedLeaves.earned - usedLeaves.earned),
    };

    console.log(allocatedLeaves, usedLeaves, remainingLeaves);

    res.json({
      allocated: allocatedLeaves,
      used: usedLeaves,
      remaining: remainingLeaves,
      monthsSinceRegistration,
    });
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    res.status(500).json({
      message: "Failed to fetch leave balance",
      error: error.message,
    });
  }
});

// Get detailed leave report data for subordinates for a specific month/year
leaverouter.get("/detailed-report", auth, async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0); // Last day of the month

    let leavesQuery = Leave.find({
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).populate("userId", "name email location");

    // If admin, only show leaves for their location
    if (user.role === "admin") {
      const userLocation = user.location;
      const usersInLocation = await User.find({ location: userLocation });
      const userIds = usersInLocation.map((u) => u._id);

      leavesQuery = leavesQuery.where("userId").in(userIds);
    }

    const leaves = await leavesQuery.sort({ submittedAt: -1 });

    // Format response to include user details and duration
    const formattedLeaves = leaves.map((leave) => {
      // Calculate duration including both start and end date
      const duration = Math.ceil(
        (new Date(leave.endDate) - new Date(leave.startDate)) /
          (1000 * 60 * 60 * 24),
      ) + 1;

      return {
        userId: leave.userId._id,
        userName: leave.userId.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        duration: duration,
        reason: leave.reason,
        status: leave.status,
        submittedAt: leave.submittedAt,
        comments: leave.comments,
        approvedAt: leave.approvedAt,
      };
    });

    res.json(formattedLeaves);
  } catch (error) {
    console.error("Error generating detailed leave report:", error);
    res.status(500).json({
      message: "Error generating detailed leave report",
      error: error.message,
    });
  }
});

// Get historical leave balance data for all subordinates
leaverouter.get("/historical-report", auth, async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Constants for leave allocation per month
    const SICK_LEAVE_MONTH = 12;
    const CASUAL_LEAVE_MONTH = 12;
    const EARNED_LEAVE_MONTH = 12;

    // Get all users under the manager's supervision
    let usersQuery;
    if (user.role === "admin") {
      // Admin sees users in their location
      usersQuery = User.find({ location: user.location });
    } else {
      // Superadmin sees all users
      usersQuery = User.find({});
    }

    const users = await usersQuery.select("_id name email createdAt");
    const currentDate = new Date();

    // For each user, calculate leave balances for every month since registration
    const historicalData = await Promise.all(users.map(async (subordinate) => {
      const registrationDate = new Date(subordinate.createdAt);
      const UserMonth = registrationDate.getMonth(); // 0-based
      const UserYear = registrationDate.getFullYear();
      const startYear = registrationDate.getFullYear();
      const startMonth = registrationDate.getMonth(); // 0-based
      const endYear = currentDate.getFullYear();
      const endMonth = currentDate.getMonth(); // 0-based

      // Get all approved leaves for this user
      const approvedLeaves = await Leave.find({
        userId: subordinate._id,
        status: "approved",
      });

      // Prepare a running total of used leaves by type up to each month
      let runningUsed = { sick: 0, casual: 0, earned: 0 };
      // Prepare a list of all months from registration to now
      const months = [];
      let y = startYear, m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        months.push({ year: y, month: m });
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }
      // For each month, calculate allocated, used, and remaining

      const monthlyBreakdown = months.map(({ year, month }) => {
        // Allocated leaves up to and including this month
        const monthsSinceRegistration = (year - startYear) * 12 +
          (month - startMonth) + 1;
        const allocated = {
          sick: monthsSinceRegistration * SICK_LEAVE_MONTH,
          casual: monthsSinceRegistration * CASUAL_LEAVE_MONTH,
          earned: monthsSinceRegistration * EARNED_LEAVE_MONTH,
        };
        // Used leaves up to and including this month
        let used = { ...runningUsed };
        approvedLeaves.forEach((leave) => {
          // If leave ends in or before this month/year, count it
          const leaveEnd = new Date(leave.endDate);
          if (
            (leaveEnd.getFullYear() < year) ||
            (leaveEnd.getFullYear() === year && leaveEnd.getMonth() <= month)
          ) {
            if (leave.leaveType in used) {
              const durationInDays = Math.ceil(
                (new Date(leave.endDate) - new Date(leave.startDate)) /
                  (1000 * 60 * 60 * 24),
              ) + 1;
              used[leave.leaveType] += durationInDays;
            }
          }
        });
        // Remaining = allocated - used
        const remaining = {
          sick: Math.max(0, allocated.sick - used.sick),
          casual: Math.max(0, allocated.casual - used.casual),
          earned: Math.max(0, allocated.earned - used.earned),
        };
        return {
          year,
          month: month,
          allocated,
          used,
          remaining,
        };
      });
      console.log(monthlyBreakdown);
      return {
        userName: subordinate.name,
        userMonth: UserMonth,
        userYear: UserYear,
        monthly: monthlyBreakdown,
      };
    }));
    console.log("Sending Data: ", historicalData);
    res.json(historicalData);
  } catch (error) {
    console.error("Error generating historical leave report:", error);
    res.status(500).json({
      message: "Error generating historical leave report",
      error: error.message,
    });
  }
});

// Get count of pending leave requests for admin/superadmin
leaverouter.get("/pending-count", auth, async (req, res) => {
  try {
    // First check if user is admin or superadmin
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get count of pending leaves that are related to this admin/superadmin
    let pendingCount = 0;
    
    if (user.role === "admin") {
      // For admin, only count subordinate leaves
      // First get all leaves
      const leaves = await Leave.find({ status: "pending" })
        .populate("userId", "name email parent_role");
      
      // Filter to only include leaves where this admin is in parent_role
      const subordinateLeaves = leaves.filter((leave) => {
        return leave.userId && 
               leave.userId.parent_role && 
               leave.userId.parent_role.length > 0 && 
               leave.userId.parent_role[0] === user.email;
      });
      
      pendingCount = subordinateLeaves.length;
    } else {
      // For superadmin, count all pending leaves
      pendingCount = await Leave.countDocuments({ status: "pending" });
    }
    
    res.json({ pendingCount });
  } catch (error) {
    console.error("Error fetching pending leave count:", error);
    res.status(500).json({
      message: "Failed to fetch pending leave count",
      error: error.message,
    });
  }
});

// Get notifications for a user (approved/rejected leaves)
leaverouter.get("/notifications", auth, async (req, res) => {
  try {
    // Find recent leaves that have been approved or rejected but not read
    const recentLeaves = await Leave.find({
      userId: req.user.userId,
      status: { $in: ["approved", "rejected"] },
      // Only find leaves that were updated in the last 7 days
      approvedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      // Only return unread notifications
      isNotificationRead: false
    }).sort({ approvedAt: -1 });
    
    const notifications = recentLeaves.map(leave => ({
      _id: leave._id,
      leaveType: leave.leaveType,
      status: leave.status,
      approvedAt: leave.approvedAt,
      read: leave.isNotificationRead
    }));
    
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
});

// Mark notifications as read
leaverouter.post("/notifications/mark-read", auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        message: "Invalid request. Expected an array of notification IDs"
      });
    }
    
    // Mark the specified leave notifications as read
    await Leave.updateMany(
      { 
        _id: { $in: notificationIds },
        userId: req.user.userId // Ensure user can only update their own notifications
      },
      { isNotificationRead: true }
    );
    
    res.json({ message: "Notifications marked as read successfully" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
});

export default leaverouter;
