export type Role = 'employee' | 'admin';

export interface EmployeeProfile {
  employeeId: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  jobTitle: string;
  department: string;
  manager: string;
  contractType: string;
  hireDate: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  email: string;
  role: Role;
  profile: EmployeeProfile;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  description: string;
  updatedAt: string;
  url: string;
}
