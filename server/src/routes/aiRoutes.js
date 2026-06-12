import express from 'express';
import { handleAIChat } from '../controllers/aiController.js';
import {
  predictPerformance,
  analyzeAttendanceRisk,
  analyzeStudentRisk,
  generateReportSummary
} from '../controllers/aiPredictionController.js';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

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
      
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .maybeSingle();

      if (user && user.is_active) {
        // Map id to _id for compatibility
        req.user = {
          ...user,
          _id: user.id
        };
      }
    } catch (error) {
      // Soft fail for public requests
    }
  }
  next();
};

router.post('/chat', optionalProtect, handleAIChat);
router.post('/performance', optionalProtect, predictPerformance);
router.post('/attendance-risk', optionalProtect, analyzeAttendanceRisk);
router.post('/student-risk', optionalProtect, analyzeStudentRisk);
router.post('/report-summary', optionalProtect, generateReportSummary);

export default router;
