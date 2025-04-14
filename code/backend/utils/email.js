import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'foundationeklavya1@gmail.com',
    pass: 'ewmy guwx keia ptqg', // Replace with your actual app password
  },
});

export default transporter;