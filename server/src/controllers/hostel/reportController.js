/**
 * Hostel Reports Controller
 * 
 * Handles all report generation requests
 */

import {
  getResidentReport,
  getRoomOccupancyReport,
  getHostelBlockReport,
  getFeeCollectionReport,
  getAvailableRoomsReport,
  getDashboardAnalytics,
  searchResidents,
  getFeeStatisticsByType,
} from '../../services/hostel/reportService.js';

/**
 * Get Resident Report
 * GET /api/hostel/reports/residents
 */
export const getResidents = async (req, res) => {
  try {
    const { hostelId, roomType, acType, blockId, search, sortBy = 'name', order = 'asc' } = req.query;

    const filters = {
      hostelId: hostelId || null,
      roomType: roomType || null,
      acType: acType || null,
      blockId: blockId || null,
    };

    const report = await getResidentReport(filters);

    // Apply search if provided
    let data = report.data;
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.name?.toLowerCase().includes(searchLower) ||
          r.registrationNumber?.toLowerCase().includes(searchLower) ||
          r.roomNumber?.toLowerCase().includes(searchLower) ||
          r.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    data.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === 'asc' ? comparison : -comparison;
    });

    res.json({
      success: true,
      message: 'Resident report generated successfully',
      total: data.length,
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getResidents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate resident report',
      error: error.message,
    });
  }
};

/**
 * Get Room Occupancy Report
 * GET /api/hostel/reports/occupancy
 */
export const getOccupancy = async (req, res) => {
  try {
    const { hostelId, roomType, acType, blockId } = req.query;

    const filters = {
      hostelId: hostelId || null,
      roomType: roomType || null,
      acType: acType || null,
      blockId: blockId || null,
    };

    const report = await getRoomOccupancyReport(filters);

    res.json({
      success: true,
      message: 'Room occupancy report generated successfully',
      summary: report.summary,
      byBlock: report.byBlock,
      allRooms: report.allRooms,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getOccupancy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate occupancy report',
      error: error.message,
    });
  }
};

/**
 * Get Hostel Block Report
 * GET /api/hostel/reports/blocks
 */
export const getBlocks = async (req, res) => {
  try {
    const { hostelId, status } = req.query;

    const filters = {
      hostelId: hostelId || null,
      status: status || null,
    };

    const report = await getHostelBlockReport(filters);

    res.json({
      success: true,
      message: 'Hostel block report generated successfully',
      total: report.total,
      data: report.data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getBlocks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hostel block report',
      error: error.message,
    });
  }
};

/**
 * Get Fee Collection Report
 * GET /api/hostel/reports/fees
 */
export const getFees = async (req, res) => {
  try {
    const { hostelId, status, feeType, startDate, endDate, sortBy = 'dueDate', order = 'desc' } = req.query;

    const filters = {
      hostelId: hostelId || null,
      status: status || null,
      feeType: feeType || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const report = await getFeeCollectionReport(filters);

    // Apply sorting
    report.data.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === 'asc' ? comparison : -comparison;
    });

    res.json({
      success: true,
      message: 'Fee collection report generated successfully',
      summary: report.summary,
      data: report.data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getFees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate fee collection report',
      error: error.message,
    });
  }
};

/**
 * Get Available Rooms Report
 * GET /api/hostel/reports/available-rooms
 */
export const getAvailableRooms = async (req, res) => {
  try {
    const { hostelId, roomType, acType, blockId } = req.query;

    const filters = {
      hostelId: hostelId || null,
      roomType: roomType || null,
      acType: acType || null,
      blockId: blockId || null,
    };

    const report = await getAvailableRoomsReport(filters);

    res.json({
      success: true,
      message: 'Available rooms report generated successfully',
      total: report.total,
      data: report.data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getAvailableRooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate available rooms report',
      error: error.message,
    });
  }
};

/**
 * Get Dashboard Analytics
 * GET /api/hostel/reports/analytics
 */
export const getAnalytics = async (req, res) => {
  try {
    const analytics = await getDashboardAnalytics();

    res.json({
      success: true,
      message: 'Dashboard analytics generated successfully',
      data: analytics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard analytics',
      error: error.message,
    });
  }
};

/**
 * Search Residents
 * GET /api/hostel/reports/search-residents
 */
export const searchResidentsHandler = async (req, res) => {
  try {
    const { q = '', page = 1, pageSize = 20 } = req.query;

    const result = await searchResidents(q, parseInt(page), parseInt(pageSize));

    res.json({
      success: true,
      message: 'Residents search completed',
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('Error in searchResidentsHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search residents',
      error: error.message,
    });
  }
};

/**
 * Get Fee Statistics
 * GET /api/hostel/reports/fee-statistics
 */
export const getFeeStats = async (req, res) => {
  try {
    const stats = await getFeeStatisticsByType();

    res.json({
      success: true,
      message: 'Fee statistics generated successfully',
      data: stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getFeeStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate fee statistics',
      error: error.message,
    });
  }
};
