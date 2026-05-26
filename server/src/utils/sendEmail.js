import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"College Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Send] Email sent to ${to} (${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${to} (Network blocked):`, error.message);
    console.log(`[Email Fallback] Proceeding without sending email.`);
    return null; // Return null instead of throwing so flow continues
  }
};

export default sendEmail;
