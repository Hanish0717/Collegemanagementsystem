import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("Sending OTP email to:", to);
    
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
    console.error("Email Error:", error);
    console.log(`[Email Fallback] Proceeding without sending email.`);
    return null; // Return null instead of throwing so flow continues
  }
};

export default sendEmail;
