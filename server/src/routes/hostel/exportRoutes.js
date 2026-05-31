/**
 * Hostel Exports Routes
 * 
 * API endpoints for exporting reports as PDF, Excel, etc.
 */

import express from 'express';
import {
  exportResidentPdfHandler,
  exportResidentExcelHandler,
  exportOccupancyPdfHandler,
  exportOccupancyExcelHandler,
  exportFeePdfHandler,
  exportFeeExcelHandler,
  exportAvailableRoomsExcelHandler,
  exportBlocksExcelHandler,
} from '../../controllers/hostel/exportController.js';

const router = express.Router();

/**
 * Resident Report Exports
 */
router.post('/residents/pdf', exportResidentPdfHandler);
router.post('/residents/excel', exportResidentExcelHandler);

/**
 * Occupancy Report Exports
 */
router.post('/occupancy/pdf', exportOccupancyPdfHandler);
router.post('/occupancy/excel', exportOccupancyExcelHandler);

/**
 * Fee Collection Report Exports
 */
router.post('/fees/pdf', exportFeePdfHandler);
router.post('/fees/excel', exportFeeExcelHandler);

/**
 * Available Rooms Report Export
 */
router.post('/available-rooms/excel', exportAvailableRoomsExcelHandler);

/**
 * Hostel Blocks Report Export
 */
router.post('/blocks/excel', exportBlocksExcelHandler);

export default router;
