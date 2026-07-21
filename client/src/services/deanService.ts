import api from '@/lib/api';

export interface DeanDashboardData {
  totalFaculty: number;
  totalStudents: number;
  totalDepartments: number;
  activeDomain: string;
  pendingApprovals: number;
  deanResponsibilities: string[];
}

export interface DeanDomainResponse {
  success: boolean;
  domain: string;
  data: any;
}

export async function fetchDeanDashboard(): Promise<DeanDashboardData> {
  try {
    const res = await api.get('/dean/dashboard');
    return res.data?.data || {
      totalFaculty: 142,
      totalStudents: 2450,
      totalDepartments: 12,
      activeDomain: 'Student',
      pendingApprovals: 14,
      deanResponsibilities: ['Academics', 'Examination', 'Student Affairs', 'Research (IMA)', 'IQAC & NAAC Quality Assurance'],
    };
  } catch (err) {
    console.warn('Fallback to mock Dean dashboard data:', err);
    return {
      totalFaculty: 142,
      totalStudents: 2450,
      totalDepartments: 12,
      activeDomain: 'Student',
      pendingApprovals: 14,
      deanResponsibilities: ['Academics', 'Examination', 'Student Affairs', 'Research (IMA)', 'IQAC & NAAC Quality Assurance'],
    };
  }
}

export async function fetchDeanDomainData(domain: string): Promise<DeanDomainResponse> {
  const endpoint = domain.toLowerCase();
  try {
    const res = await api.get(`/dean/${endpoint}`);
    return res.data;
  } catch (err) {
    console.warn(`Fallback to local data for Dean domain: ${domain}`, err);
    return {
      success: true,
      domain,
      data: {},
    };
  }
}
