/**
 * Hostel Reports Routes
 * 
 * API endpoints for all report generation and data export
 */

import express from 'express';
import {
  getResidents,
  getOccupancy,
  getBlocks,
  getFees,
  getAvailableRooms,
  getAnalytics,
  searchResidentsHandler,
  getFeeStats,
} from '../../controllers/hostel/reportController.js';

const router = express.Router();

/**
 * Report Endpoints
 */

// Resident Reports
router.get('/residents', getResidents);
router.get('/search-residents', searchResidentsHandler);

// Room Occupancy Report
router.get('/occupancy', getOccupancy);

// Hostel Block Report
router.get('/blocks', getBlocks);

// Fee Collection Report
router.get('/fees', getFees);

// Available Rooms Report
router.get('/available-rooms', getAvailableRooms);

// Dashboard Analytics
router.get('/analytics', getAnalytics);

// Fee Statistics
router.get('/fee-statistics', getFeeStats);

export default router;
