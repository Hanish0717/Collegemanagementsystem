/**
 * Hostel Export Service
 * 
 * Handles PDF and Excel export functionality for reports
 */

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Format date to readable string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format currency to INR
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Export Resident Report to PDF
 */
export const exportResidentPDF = async (residents, filename = 'resident-report.pdf') => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = resolve(__dirname, '../../../exports', filename);
      const doc = new PDFDocument({
        margin: 30,
        size: 'A4',
        bufferPages: true,
      });

      const stream = createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Resident Report', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Generated: ${formatDate(new Date())}`, { align: 'center' });
      doc.fontSize(10).text(`Total Residents: ${residents.length}`, { align: 'center' });
      doc.moveDown();

      // Table Headers
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 150;
      const col3 = 250;
      const col4 = 330;
      const col5 = 410;
      const rowHeight = 20;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Name', col1, tableTop);
      doc.text('Reg. No.', col2, tableTop);
      doc.text('Block', col3, tableTop);
      doc.text('Room', col4, tableTop);
      doc.text('Status', col5, tableTop);

      // Table Rows
      doc.font('Helvetica').fontSize(8);
      let y = tableTop + rowHeight;

      residents.forEach((resident) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 30;
        }

        doc.text((resident.name || '—').substring(0, 20), col1, y);
        doc.text((resident.registrationNumber || '—').substring(0, 15), col2, y);
        doc.text((resident.hostelBlock || '—').substring(0, 15), col3, y);
        doc.text((resident.roomNumber || '—').substring(0, 10), col4, y);
        doc.text(resident.status || '—', col5, y);

        y += rowHeight;
      });

      // Footer
      doc.fontSize(8).text('Page 1', { align: 'center', y: doc.page.height - 20 });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export Occupancy Report to PDF
 */
export const exportOccupancyPDF = async (reportData, filename = 'occupancy-report.pdf') => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = resolve(__dirname, '../../../exports', filename);
      const doc = new PDFDocument({
        margin: 30,
        size: 'A4',
      });

      const stream = createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text('Room Occupancy Report', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Generated: ${formatDate(new Date())}`, { align: 'center' });
      doc.moveDown();

      // Summary Box
      const summary = reportData.summary;
      doc.fontSize(10).font('Helvetica-Bold').text('Summary Statistics:');
      doc.fontSize(9).font('Helvetica');
      doc.text(`Total Rooms: ${summary.totalRooms} | Occupied: ${summary.totalOccupiedRooms} | Vacant: ${summary.totalVacantRooms}`);
      doc.text(`Total Beds: ${summary.totalBeds} | Occupied: ${summary.totalOccupiedBeds} | Available: ${summary.totalAvailableBeds}`);
      doc.moveDown();

      // Block-wise Report
      doc.fontSize(11).font('Helvetica-Bold').text('Block-wise Breakdown:');
      doc.fontSize(9).font('Helvetica');

      reportData.byBlock.forEach((block, index) => {
        doc.text(`\n${index + 1}. ${block.blockName}`);
        doc.fontSize(8).text(`   Rooms: ${block.totalRooms} (Occupied: ${block.occupiedRooms}, Vacant: ${block.vacantRooms})`);
        doc.text(`   Beds: ${block.totalBeds} (Occupied: ${block.occupiedBeds}, Available: ${block.availableBeds})`);
        doc.text(`   Occupancy Rate: ${block.occupancyPercentage}%`);
        doc.fontSize(9);
      });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export Fee Collection Report to PDF
 */
export const exportFeePDF = async (feeData, summary, filename = 'fee-report.pdf') => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = resolve(__dirname, '../../../exports', filename);
      const doc = new PDFDocument({
        margin: 30,
        size: 'A4',
        bufferPages: true,
      });

      const stream = createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text('Fee Collection Report', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Generated: ${formatDate(new Date())}`, { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(10).font('Helvetica-Bold').text('Summary:');
      doc.fontSize(9).font('Helvetica');
      doc.text(`Total Records: ${summary.totalRecords}`);
      doc.text(`Total Amount: ${formatCurrency(summary.totalAmount)}`);
      doc.text(`Paid Amount: ${formatCurrency(summary.paidAmount)}`);
      doc.text(`Pending Amount: ${formatCurrency(summary.pendingAmount)}`);
      doc.text(`Collection Rate: ${summary.collectionRate}%`);
      doc.moveDown();

      // Table
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 150;
      const col3 = 250;
      const col4 = 330;
      const rowHeight = 18;

      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Name', col1, tableTop);
      doc.text('Block', col2, tableTop);
      doc.text('Amount', col3, tableTop);
      doc.text('Status', col4, tableTop);

      doc.font('Helvetica').fontSize(7);
      let y = tableTop + rowHeight;

      feeData.slice(0, 50).forEach((fee) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 30;
        }

        doc.text((fee.residentName || '—').substring(0, 20), col1, y);
        doc.text((fee.hostelBlock || '—').substring(0, 15), col2, y);
        doc.text(formatCurrency(fee.totalAmount), col3, y);
        doc.text(fee.paymentStatus || '—', col4, y);

        y += rowHeight;
      });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export Resident Report to Excel
 */
export const exportResidentExcel = async (residents, filename = 'resident-report.xlsx') => {
  try {
    const filePath = resolve(__dirname, '../../../exports', filename);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Residents');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Registration Number', key: 'registrationNumber', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Hostel Block', key: 'hostelBlock', width: 20 },
      { header: 'Room Number', key: 'roomNumber', width: 15 },
      { header: 'Room Type', key: 'roomType', width: 15 },
      { header: 'AC Type', key: 'acType', width: 15 },
      { header: 'Check-In Date', key: 'checkInDate', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Year', key: 'year', width: 10 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    // Add data rows
    residents.forEach((resident) => {
      worksheet.addRow({
        name: resident.name || '—',
        registrationNumber: resident.registrationNumber || '—',
        email: resident.email || '—',
        phone: resident.phone || '—',
        hostelBlock: resident.hostelBlock || '—',
        roomNumber: resident.roomNumber || '—',
        roomType: resident.roomType || '—',
        acType: resident.acType || '—',
        checkInDate: resident.checkInDate ? formatDate(resident.checkInDate) : '—',
        status: resident.status || '—',
        department: resident.department || '—',
        year: resident.year || '—',
      });
    });

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Resident Report Summary']);
    summarySheet.addRow(['Generated Date', formatDate(new Date())]);
    summarySheet.addRow(['Total Residents', residents.length]);
    summarySheet.addRow(['Active Residents', residents.filter((r) => r.status === 'active').length]);

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};

/**
 * Export Fee Collection Report to Excel
 */
export const exportFeeExcel = async (feeData, summary, filename = 'fee-report.xlsx') => {
  try {
    const filePath = resolve(__dirname, '../../../exports', filename);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fees');

    // Add headers
    worksheet.columns = [
      { header: 'Resident Name', key: 'residentName', width: 25 },
      { header: 'Registration No', key: 'registrationNumber', width: 18 },
      { header: 'Hostel Block', key: 'hostelBlock', width: 20 },
      { header: 'Fee Type', key: 'feeType', width: 20 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Paid Amount', key: 'paidAmount', width: 15 },
      { header: 'Pending Amount', key: 'pendingAmount', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };

    // Add data rows
    feeData.forEach((fee) => {
      worksheet.addRow({
        residentName: fee.residentName || '—',
        registrationNumber: fee.registrationNumber || '—',
        hostelBlock: fee.hostelBlock || '—',
        feeType: fee.feeType || '—',
        month: fee.month || '—',
        year: fee.year || '—',
        totalAmount: fee.totalAmount || 0,
        paidAmount: fee.paidAmount || 0,
        pendingAmount: fee.pendingAmount || 0,
        dueDate: fee.dueDate ? formatDate(fee.dueDate) : '—',
        paymentStatus: fee.paymentStatus || '—',
        paymentMethod: fee.paymentMethod || '—',
      });
    });

    // Format currency columns
    worksheet.getColumn('G').numFmt = '₹#,##0';
    worksheet.getColumn('H').numFmt = '₹#,##0';
    worksheet.getColumn('I').numFmt = '₹#,##0';

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Fee Collection Report Summary']);
    summarySheet.addRow(['Generated Date', formatDate(new Date())]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Total Records', summary.totalRecords]);
    summarySheet.addRow(['Total Amount', summary.totalAmount]);
    summarySheet.addRow(['Paid Amount', summary.paidAmount]);
    summarySheet.addRow(['Pending Amount', summary.pendingAmount]);
    summarySheet.addRow(['Collection Rate', `${summary.collectionRate}%`]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Paid Records', summary.paidCount]);
    summarySheet.addRow(['Pending Records', summary.pendingCount]);
    summarySheet.addRow(['Overdue Records', summary.overdueCount]);

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    console.error('Error exporting fee Excel:', error);
    throw error;
  }
};

/**
 * Export Occupancy Report to Excel
 */
export const exportOccupancyExcel = async (occupancyData, filename = 'occupancy-report.xlsx') => {
  try {
    const filePath = resolve(__dirname, '../../../exports', filename);
    const workbook = new ExcelJS.Workbook();

    // Rooms sheet
    const roomsSheet = workbook.addWorksheet('Rooms');
    roomsSheet.columns = [
      { header: 'Block', key: 'block', width: 20 },
      { header: 'Room Number', key: 'roomNumber', width: 15 },
      { header: 'Floor', key: 'floor', width: 10 },
      { header: 'Type', key: 'roomType', width: 12 },
      { header: 'AC Type', key: 'acType', width: 12 },
      { header: 'Capacity', key: 'capacity', width: 10 },
      { header: 'Occupants', key: 'occupants', width: 10 },
      { header: 'Available', key: 'available', width: 10 },
      { header: 'Occupancy %', key: 'occupancyPercentage', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    roomsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    roomsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    occupancyData.allRooms.forEach((room) => {
      roomsSheet.addRow(room);
    });

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Occupancy Report Summary']);
    summarySheet.addRow(['Generated Date', formatDate(new Date())]);
    summarySheet.addRow([]);

    const summary = occupancyData.summary;
    summarySheet.addRow(['Total Rooms', summary.totalRooms]);
    summarySheet.addRow(['Occupied Rooms', summary.totalOccupiedRooms]);
    summarySheet.addRow(['Vacant Rooms', summary.totalVacantRooms]);
    summarySheet.addRow(['Total Beds', summary.totalBeds]);
    summarySheet.addRow(['Occupied Beds', summary.totalOccupiedBeds]);
    summarySheet.addRow(['Available Beds', summary.totalAvailableBeds]);

    // Block-wise sheet
    const blockSheet = workbook.addWorksheet('By Block');
    blockSheet.columns = [
      { header: 'Block Name', key: 'blockName', width: 20 },
      { header: 'Total Rooms', key: 'totalRooms', width: 12 },
      { header: 'Occupied Rooms', key: 'occupiedRooms', width: 15 },
      { header: 'Vacant Rooms', key: 'vacantRooms', width: 12 },
      { header: 'Total Beds', key: 'totalBeds', width: 12 },
      { header: 'Occupied Beds', key: 'occupiedBeds', width: 14 },
      { header: 'Available Beds', key: 'availableBeds', width: 14 },
      { header: 'Occupancy %', key: 'occupancyPercentage', width: 12 },
    ];

    blockSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    blockSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    occupancyData.byBlock.forEach((block) => {
      blockSheet.addRow(block);
    });

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    console.error('Error exporting occupancy Excel:', error);
    throw error;
  }
};

/**
 * Clean up exported file after sending
 */
export const cleanupExportFile = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up export file:', error);
  }
};
