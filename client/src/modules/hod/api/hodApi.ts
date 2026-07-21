import api from '@/lib/api';
import { DepartmentCode } from '../types';

export interface HODApiParams {
  department?: DepartmentCode;
  academicYear?: string;
  institutionId?: string;
  [key: string]: any;
}

/**
 * Enhanced API helper for HOD module that automatically injects
 * Department Isolation parameters (department, academicYear, institutionId).
 */
export const hodApi = {
  get: async <T = any>(url: string, params: HODApiParams = {}, deptCode: DepartmentCode = 'AIML') => {
    const defaultParams = {
      department: params.department || deptCode,
      academicYear: params.academicYear || '2025-2026',
      institutionId: params.institutionId || 'INST-001',
      ...params,
    };
    const response = await api.get<T>(url, { params: defaultParams });
    return response.data;
  },

  post: async <T = any>(url: string, data: any = {}, deptCode: DepartmentCode = 'AIML') => {
    const payload = {
      department: data.department || deptCode,
      academicYear: data.academicYear || '2025-2026',
      institutionId: data.institutionId || 'INST-001',
      ...data,
    };
    const response = await api.post<T>(url, payload);
    return response.data;
  },

  put: async <T = any>(url: string, data: any = {}, deptCode: DepartmentCode = 'AIML') => {
    const payload = {
      department: data.department || deptCode,
      academicYear: data.academicYear || '2025-2026',
      institutionId: data.institutionId || 'INST-001',
      ...data,
    };
    const response = await api.put<T>(url, payload);
    return response.data;
  },

  delete: async <T = any>(url: string, params: HODApiParams = {}, deptCode: DepartmentCode = 'AIML') => {
    const defaultParams = {
      department: params.department || deptCode,
      academicYear: params.academicYear || '2025-2026',
      ...params,
    };
    const response = await api.delete<T>(url, { params: defaultParams });
    return response.data;
  },
};
