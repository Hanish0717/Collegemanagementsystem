import api from '../lib/api';

export interface BusItem {
  id: string;
  route: string;
  driver: string;
  coverage: string;
  students: number;
  status: string;
  bus?: {
    number: string;
    capacity: number;
    status: string;
  } | null;
  stops?: Array<{ id: string; name: string; landmark: string }>;
}

export interface StudentTransportDetails {
  student: {
    id: string;
    fullName: string;
    rollNumber: string;
    email: string;
    phone: string;
    department: string;
    year: number;
    semester: number;
    cgpa: number;
    attendance: number;
    isActive: boolean;
  };
  allocation: {
    passNumber: string;
    academicYear: string;
    monthlyFare: number;
    status: string;
  } | null;
  route: {
    id: string;
    name: string;
    routeNumber: string;
    startPoint: string;
    endPoint: string;
    stops: Array<{ id: string; name: string; landmark: string; arrival?: string; fare?: number }>;
  } | null;
  bus: {
    busNumber: string;
    make: string;
    model: string;
    capacity: number;
    type: string;
    status: string;
    gpsDeviceNumber: string;
  };
  driver: {
    fullName: string;
    phone: string;
    licenseNumber: string;
    experienceYears: number;
    status: string;
  };
}

export async function fetchTransportData(): Promise<{ buses: BusItem[] }> {
  const { data } = await api.get<{ success: boolean; data: { buses: BusItem[] } }>(
    '/api/transport/dashboard',
  );
  return data.data;
}

export async function verifyStudentTransportApi(
  rollNumber?: string,
  fullName?: string,
  branchName?: string,
): Promise<StudentTransportDetails> {
  const { data } = await api.post<{ success: boolean; data: StudentTransportDetails }>(
    '/api/transport/verify-student',
    { rollNumber, fullName, branchName },
  );
  return data.data;
}

export interface BusTelemetry {
  busNumber: string;
  latitude: number;
  longitude: number;
  status: 'Not Started' | 'On The Way' | 'Arrived';
  currentStop: string;
  eta: number;
  speed: number;
  lastUpdated: string;
}

export async function getBusTelemetryApi(busNumber: string): Promise<BusTelemetry> {
  const { data } = await api.get<{ success: boolean; data: BusTelemetry }>(
    `/api/transport/telemetry?busNumber=${encodeURIComponent(busNumber)}`,
  );
  return data.data;
}

export async function updateBusTelemetryApi(
  payload: Partial<BusTelemetry> & { busNumber: string },
): Promise<any> {
  const { data } = await api.post<{ success: boolean; message: string; data: any }>(
    '/api/transport/telemetry',
    payload,
  );
  return data;
}
