import express from 'express';
import { handleAIChat } from '../controllers/aiController.js';
import jwt from 'jsonwebtoken';
import User from '../models/auth/User.js';

const router = express.Router();

// Optional JWT verification middleware
const optionalProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Soft fail for public requests
    }
  }
  next();
};

router.post('/chat', optionalProtect, handleAIChat);

export default router;
