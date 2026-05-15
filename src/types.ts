export type Role = 'employee' | 'admin';

export interface EmployeeProfile {
  employeeId: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  personalEmail: string;
  workEmail: string;
  phone: string;
  workPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  governmentIdType: string;
  governmentIdNumber: string;
  ssnLast4: string;
  workAuthorizationType: string;
  workAuthorizationExpiry: string;
  jobTitle: string;
  department: string;
  manager: string;
  contractType: string;
  employmentType: string;
  hireDate: string;
  probationEndDate: string;
  workLocation: string;
  shiftType: string;
  weeklyHours: string;
  payType: string;
  basePay: string;
  bonusEligible: string;
  bankName: string;
  bankAccountLast4: string;
  routingLast4: string;
  uniformSize: string;
  equipmentIssued: string;
  licenses: string;
  certifications: string;
  trainingRequired: string;
  performanceRating: string;
  mfaEnabled: string;
  lastPasswordChange: string;
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
