import bcrypt from 'bcryptjs';
import User from '../models/users.js';
import crypto from 'crypto';
import express from 'express';
import ResetToken from '../models/resettoken.js';
const passwordrouter = express.Router();
import transporter from '../utils/email.js'; // Import the transporter
import auth from '../middleware/auth.js';
  
  // Request password reset (send email)
  passwordrouter.post('/request', async (req, res) => {
    try {
      const { email } = req.body;
      console.log(email, "email");
  
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
        from: 'foundationeklavya1@gmail.com',
        to: user.email,
        subject: 'Password Reset Request',
        html: `
    <h1>Reset Your Password</h1>
    <p>Hello ${user.firstName || user.name?.split(' ')[0] || ''},</p>
    <p>We received a request to reset your password for your Eklavya Foundation account.</p>
    <p>To reset your password, click on the button below:</p>
    
    <!-- Styled button -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="#3b82f6">
                <a href="${resetUrl}" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
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
  passwordrouter.get('/verify/:token', async (req, res) => {
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
  passwordrouter.post('/reset/:token',async (req, res) => {
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

export default passwordrouter;
