import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Department from '../models/academic/Department.js';
import Subject from '../models/academic/Subject.js';

const router = express.Router();

// Retrieve all active departments for selects/dropdowns
router.get('/departments', protect, async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
});

// Retrieve all active subjects for selects/dropdowns
router.get('/subjects', protect, async (req, res, next) => {
  try {
    const { department } = req.query;
    const filter = { isActive: true };
    if (department) {
      filter.department = department;
    }
    const subjects = await Subject.find(filter).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
