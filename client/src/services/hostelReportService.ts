/**
 * Hostel Reports Service
 * Frontend service for fetching and exporting hostel reports
 */

import api from '../lib/api';
import { toast } from 'sonner';

const BASE_URL = '/api/hostel/reports';
const EXPORT_URL = '/api/hostel/exports';

/**
 * Fetch Resident Report
 */
export const fetchResidentReport = async (filters: any = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.hostelId) params.append('hostelId', filters.hostelId);
    if (filters.roomType) params.append('roomType', filters.roomType);
    if (filters.acType) params.append('acType', filters.acType);
    if (filters.blockId) params.append('blockId', filters.blockId);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.order) params.append('order', filters.order);

    const response = await api.get(`${BASE_URL}/residents?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resident report:', error);
    toast.error('Failed to fetch resident report');
    throw error;
  }
};

/**
 * Fetch Room Occupancy Report
 */
export const fetchOccupancyReport = async (filters: any = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.hostelId) params.append('hostelId', filters.hostelId);
    if (filters.roomType) params.append('roomType', filters.roomType);
    if (filters.acType) params.append('acType', filters.acType);
    if (filters.blockId) params.append('blockId', filters.blockId);

    const response = await api.get(`${BASE_URL}/occupancy?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching occupancy report:', error);
    toast.error('Failed to fetch occupancy report');
    throw error;
  }
};

/**
 * Fetch Hostel Block Report
 */
export const fetchBlockReport = async (filters: any = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.hostelId) params.append('hostelId', filters.hostelId);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`${BASE_URL}/blocks?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching block report:', error);
    toast.error('Failed to fetch block report');
    throw error;
  }
};

/**
 * Fetch Fee Collection Report
 */
export const fetchFeeReport = async (filters: any = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.hostelId) params.append('hostelId', filters.hostelId);
    if (filters.status) params.append('status', filters.status);
    if (filters.feeType) params.append('feeType', filters.feeType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.order) params.append('order', filters.order);

    const response = await api.get(`${BASE_URL}/fees?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fee report:', error);
    toast.error('Failed to fetch fee report');
    throw error;
  }
};

/**
 * Fetch Available Rooms Report
 */
export const fetchAvailableRoomsReport = async (filters: any = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.hostelId) params.append('hostelId', filters.hostelId);
    if (filters.roomType) params.append('roomType', filters.roomType);
    if (filters.acType) params.append('acType', filters.acType);
    if (filters.blockId) params.append('blockId', filters.blockId);

    const response = await api.get(`${BASE_URL}/available-rooms?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available rooms report:', error);
    toast.error('Failed to fetch available rooms report');
    throw error;
  }
};

/**
 * Fetch Dashboard Analytics
 */
export const fetchDashboardAnalytics = async () => {
  try {
    const response = await api.get(`${BASE_URL}/analytics`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    toast.error('Failed to fetch dashboard analytics');
    throw error;
  }
};

/**
 * Search Residents
 */
export const searchResidents = async (
  query: string = '',
  page: number = 1,
  pageSize: number = 20,
) => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));

    const response = await api.get(`${BASE_URL}/search-residents?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error searching residents:', error);
    throw error;
  }
};

/**
 * Fetch Fee Statistics
 */
export const fetchFeeStatistics = async () => {
  try {
    const response = await api.get(`${BASE_URL}/fee-statistics`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching fee statistics:', error);
    throw error;
  }
};

/**
 * Export Resident Report as PDF
 */
export const exportResidentPDF = async (filters: any = {}) => {
  try {
    const response = await api.post(`${EXPORT_URL}/residents/pdf`, filters, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resident-report.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Resident report exported successfully');
  } catch (error) {
    console.error('Error exporting resident PDF:', error);
    toast.error('Failed to export resident report as PDF');
    throw error;
  }
};

/**
 * Export Resident Report as Excel
 */
export const exportResidentExcel = async (filters: any = {}) => {
  try {
    const response = await api.post(`${EXPORT_URL}/residents/excel`, filters, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resident-report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Resident report exported successfully');
  } catch (error) {
    console.error('Error exporting resident Excel:', error);
    toast.error('Failed to export resident report as Excel');
    throw error;
  }
};

/**
 * Export Occupancy Report as PDF
 */
export const exportOccupancyPDF = async (filters: any = {}) => {
  try {
    const response = await api.post(`${EXPORT_URL}/occupancy/pdf`, filters, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'occupancy-report.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Occupancy report exported successfully');
  } catch (error) {
    console.error('Error exporting occupancy PDF:', error);
    toast.error('Failed to export occupancy report as PDF');
    throw error;
  }
};

/**
 * Export Occupancy Report as Excel
 */
export const exportOccupancyExcel = async (filters: any = {}) => {
  try {
    const response = await api.post(`${EXPORT_URL}/occupancy/excel`, filters, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'occupancy-report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Occupancy report exported successfully');
  } catch (error) {
    console.error('Error exporting occupancy Excel:', error);
    toast.error('Failed to export occupancy report as Excel');
    throw error;
  }
};

/**
 * Export Fee Report as PDF
 */
export const exportFeePDF = async (filters: any = {}) => {
  try {
    const response = await api.post(`${EXPORT_URL}/fees/pdf`, filters, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'fee-report.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Fee report exported successfully');
  } catch (error) {
    console.error('Error exporting fee PDF:', error);
    toast.error('Failed to export fee report as PDF');
    throw error;
  }
};

/**
 * Export Fee Report as Excel
 */
export const exportFeeExcel = async (filters: any = {}) => {
  try {
    const response = await api.post(`${EXPORT_URL}/fees/excel`, filters, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'fee-report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Fee report exported successfully');
  } catch (error) {
    console.error('Error exporting fee Excel:', error);
    toast.error('Failed to export fee report as Excel');
    throw error;
  }
};

/**
 * Export Available Rooms Report as Excel
 */
export const exportAvailableRoomsExcel = async (filters: any = {}) => {
  try {
    const response = await api.post(`${EXPORT_URL}/available-rooms/excel`, filters, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'available-rooms.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Available rooms report exported successfully');
  } catch (error) {
    console.error('Error exporting available rooms Excel:', error);
    toast.error('Failed to export available rooms report');
    throw error;
  }
};

/**
 * Export Hostel Blocks Report as Excel
 */
export const exportBlocksExcel = async (filters: any = {}) => {
  try {
    const response = await api.post(`${EXPORT_URL}/blocks/excel`, filters, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'hostel-blocks.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Hostel blocks report exported successfully');
  } catch (error) {
    console.error('Error exporting blocks Excel:', error);
    toast.error('Failed to export hostel blocks report');
    throw error;
  }
};
