export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: string; // backend role string e.g. "super-admin"
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email?: string;
  admissionNumber?: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}
