/**
 * Hostel Export Controller
 * 
 * Handles PDF and Excel export requests for reports
 */

import {
  getResidentReport,
  getRoomOccupancyReport,
  getFeeCollectionReport,
  getAvailableRoomsReport,
  getHostelBlockReport,
} from '../../services/hostel/reportService.js';

import {
  exportResidentPDF,
  exportResidentExcel,
  exportOccupancyPDF,
  exportOccupancyExcel,
  exportFeePDF,
  exportFeeExcel,
  cleanupExportFile,
} from '../../services/hostel/exportService.js';

/**
 * Export Resident Report as PDF
 * POST /api/hostel/exports/residents/pdf
 */
export const exportResidentPdfHandler = async (req, res) => {
  try {
    const { hostelId, roomType, acType, blockId } = req.body;

    const filters = {
      hostelId: hostelId || null,
      roomType: roomType || null,
      acType: acType || null,
      blockId: blockId || null,
    };

    const report = await getResidentReport(filters);
    const filePath = await exportResidentPDF(report.data, 'resident-report.pdf');

    res.download(filePath, 'resident-report.pdf', (err) => {
      if (err) console.error('Download error:', err);
      cleanupExportFile(filePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error in exportResidentPdfHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export resident report as PDF',
      error: error.message,
    });
  }
};

/**
 * Export Resident Report as Excel
 * POST /api/hostel/exports/residents/excel
 */
export const exportResidentExcelHandler = async (req, res) => {
  try {
    const { hostelId, roomType, acType, blockId } = req.body;

    const filters = {
      hostelId: hostelId || null,
      roomType: roomType || null,
      acType: acType || null,
      blockId: blockId || null,
    };

    const report = await getResidentReport(filters);
    const filePath = await exportResidentExcel(report.data, 'resident-report.xlsx');

    res.download(filePath, 'resident-report.xlsx', (err) => {
      if (err) console.error('Download error:', err);
      cleanupExportFile(filePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error in exportResidentExcelHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export resident report as Excel',
      error: error.message,
    });
  }
};

/**
 * Export Occupancy Report as PDF
 * POST /api/hostel/exports/occupancy/pdf
 */
export const exportOccupancyPdfHandler = async (req, res) => {
  try {
    const { hostelId, roomType, acType, blockId } = req.body;

    const filters = {
      hostelId: hostelId || null,
      roomType: roomType || null,
      acType: acType || null,
      blockId: blockId || null,
    };

    const report = await getRoomOccupancyReport(filters);
    const filePath = await exportOccupancyPDF(report, 'occupancy-report.pdf');

    res.download(filePath, 'occupancy-report.pdf', (err) => {
      if (err) console.error('Download error:', err);
      cleanupExportFile(filePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error in exportOccupancyPdfHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export occupancy report as PDF',
      error: error.message,
    });
  }
};

/**
 * Export Occupancy Report as Excel
 * POST /api/hostel/exports/occupancy/excel
 */
export const exportOccupancyExcelHandler = async (req, res) => {
  try {
    const { hostelId, roomType, acType, blockId } = req.body;

    const filters = {
      hostelId: hostelId || null,
      roomType: roomType || null,
      acType: acType || null,
      blockId: blockId || null,
    };

    const report = await getRoomOccupancyReport(filters);
    const filePath = await exportOccupancyExcel(report, 'occupancy-report.xlsx');

    res.download(filePath, 'occupancy-report.xlsx', (err) => {
      if (err) console.error('Download error:', err);
      cleanupExportFile(filePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error in exportOccupancyExcelHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export occupancy report as Excel',
      error: error.message,
    });
  }
};

/**
 * Export Fee Collection Report as PDF
 * POST /api/hostel/exports/fees/pdf
 */
export const exportFeePdfHandler = async (req, res) => {
  try {
    const { hostelId, status, feeType, startDate, endDate } = req.body;

    const filters = {
      hostelId: hostelId || null,
      status: status || null,
      feeType: feeType || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const report = await getFeeCollectionReport(filters);
    const filePath = await exportFeePDF(report.data, report.summary, 'fee-report.pdf');

    res.download(filePath, 'fee-report.pdf', (err) => {
      if (err) console.error('Download error:', err);
      cleanupExportFile(filePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error in exportFeePdfHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export fee report as PDF',
      error: error.message,
    });
  }
};

/**
 * Export Fee Collection Report as Excel
 * POST /api/hostel/exports/fees/excel
 */
export const exportFeeExcelHandler = async (req, res) => {
  try {
    const { hostelId, status, feeType, startDate, endDate } = req.body;

    const filters = {
      hostelId: hostelId || null,
      status: status || null,
      feeType: feeType || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const report = await getFeeCollectionReport(filters);
    const filePath = await exportFeeExcel(report.data, report.summary, 'fee-report.xlsx');

    res.download(filePath, 'fee-report.xlsx', (err) => {
      if (err) console.error('Download error:', err);
      cleanupExportFile(filePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error in exportFeeExcelHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export fee report as Excel',
      error: error.message,
    });
  }
};

/**
 * Export Available Rooms Report as Excel
 * POST /api/hostel/exports/available-rooms/excel
 */
export const exportAvailableRoomsExcelHandler = async (req, res) => {
  try {
    const { hostelId, roomType, acType, blockId } = req.body;

    const filters = {
      hostelId: hostelId || null,
      roomType: roomType || null,
      acType: acType || null,
      blockId: blockId || null,
    };

    const report = await getAvailableRoomsReport(filters);

    // Use ExcelJS directly for available rooms
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet('Available Rooms');

    worksheet.columns = [
      { header: 'Hostel Block', key: 'hostelBlock', width: 20 },
      { header: 'Room Number', key: 'roomNumber', width: 15 },
      { header: 'Floor', key: 'floor', width: 10 },
      { header: 'Room Type', key: 'roomType', width: 12 },
      { header: 'AC Type', key: 'acType', width: 12 },
      { header: 'Capacity', key: 'capacity', width: 10 },
      { header: 'Current Occupancy', key: 'currentOccupancy', width: 15 },
      { header: 'Available Beds', key: 'availableBeds', width: 12 },
      { header: 'Occupancy %', key: 'occupancyPercentage', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    report.data.forEach((room) => {
      worksheet.addRow(room);
    });

    const filePath = '/tmp/available-rooms.xlsx';
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, 'available-rooms.xlsx', (err) => {
      if (err) console.error('Download error:', err);
      cleanupExportFile(filePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error in exportAvailableRoomsExcelHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export available rooms report',
      error: error.message,
    });
  }
};

/**
 * Export Hostel Block Report as Excel
 * POST /api/hostel/exports/blocks/excel
 */
export const exportBlocksExcelHandler = async (req, res) => {
  try {
    const { hostelId, status } = req.body;

    const filters = {
      hostelId: hostelId || null,
      status: status || null,
    };

    const report = await getHostelBlockReport(filters);

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet('Hostel Blocks');

    worksheet.columns = [
      { header: 'Hostel Name', key: 'hostelName', width: 20 },
      { header: 'Block Name', key: 'blockName', width: 20 },
      { header: 'Total Rooms', key: 'totalRooms', width: 12 },
      { header: 'AC Rooms', key: 'acRooms', width: 12 },
      { header: 'Non-AC Rooms', key: 'nonAcRooms', width: 15 },
      { header: 'Total Capacity', key: 'capacity', width: 15 },
      { header: 'Occupied Beds', key: 'occupiedBeds', width: 14 },
      { header: 'Available Beds', key: 'availableBeds', width: 14 },
      { header: 'Occupancy Rate %', key: 'occupancyRate', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    report.data.forEach((block) => {
      worksheet.addRow(block);
    });

    const filePath = '/tmp/hostel-blocks.xlsx';
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, 'hostel-blocks.xlsx', (err) => {
      if (err) console.error('Download error:', err);
      cleanupExportFile(filePath).catch(console.error);
    });
  } catch (error) {
    console.error('Error in exportBlocksExcelHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export hostel blocks report',
      error: error.message,
    });
  }
};
