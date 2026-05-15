import { FormEvent, useEffect, useState } from 'react';
import type { DocumentItem, EmployeeProfile, User } from '../../types';

const emptyProfile: EmployeeProfile = {
  employeeId: '', firstName: '', lastName: '', preferredName: '', dateOfBirth: '', placeOfBirth: '', nationality: '',
  personalEmail: '', workEmail: '', phone: '', workPhone: '', addressLine1: '', addressLine2: '', city: '',
  state: '', postalCode: '', country: '', emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
  emergencyContactEmail: '', governmentIdType: '', governmentIdNumber: '', ssnLast4: '', workAuthorizationType: '',
  workAuthorizationExpiry: '', jobTitle: '', department: '', manager: '', contractType: '', employmentType: '', hireDate: '',
  probationEndDate: '', workLocation: '', shiftType: '', weeklyHours: '', payType: '', basePay: '', bonusEligible: '',
  bankName: '', bankAccountLast4: '', routingLast4: '', uniformSize: '', equipmentIssued: '', licenses: '', certifications: '',
  trainingRequired: '', performanceRating: '', mfaEnabled: 'No', lastPasswordChange: '', status: 'active'
};

const profileFields: Array<{ key: keyof EmployeeProfile; label: string; type?: string }> = [
  { key: 'employeeId', label: 'Employee ID' }, { key: 'firstName', label: 'First Name' }, { key: 'lastName', label: 'Last Name' },
  { key: 'preferredName', label: 'Preferred Name' }, { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' }, { key: 'placeOfBirth', label: 'Place of Birth' },
  { key: 'nationality', label: 'Nationality' }, { key: 'personalEmail', label: 'Personal Email', type: 'email' }, { key: 'workEmail', label: 'Work Email', type: 'email' },
  { key: 'phone', label: 'Personal Phone' }, { key: 'workPhone', label: 'Work Phone' }, { key: 'addressLine1', label: 'Address Line 1' },
  { key: 'addressLine2', label: 'Address Line 2' }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' },
  { key: 'postalCode', label: 'Postal Code' }, { key: 'country', label: 'Country' }, { key: 'emergencyContactName', label: 'Emergency Contact Name' },
  { key: 'emergencyContactRelation', label: 'Emergency Contact Relation' }, { key: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
  { key: 'emergencyContactEmail', label: 'Emergency Contact Email', type: 'email' }, { key: 'governmentIdType', label: 'Government ID Type' },
  { key: 'governmentIdNumber', label: 'Government ID Number' }, { key: 'ssnLast4', label: 'SSN Last 4' }, { key: 'workAuthorizationType', label: 'Work Authorization Type' },
  { key: 'workAuthorizationExpiry', label: 'Work Authorization Expiry', type: 'date' }, { key: 'jobTitle', label: 'Job Title' },
  { key: 'department', label: 'Department' }, { key: 'manager', label: 'Manager' }, { key: 'contractType', label: 'Contract Type' },
  { key: 'employmentType', label: 'Employment Type' }, { key: 'hireDate', label: 'Hire Date', type: 'date' }, { key: 'probationEndDate', label: 'Probation End Date', type: 'date' },
  { key: 'workLocation', label: 'Work Location' }, { key: 'shiftType', label: 'Shift Type' }, { key: 'weeklyHours', label: 'Weekly Hours' },
  { key: 'payType', label: 'Pay Type' }, { key: 'basePay', label: 'Base Pay' }, { key: 'bonusEligible', label: 'Bonus Eligible' },
  { key: 'bankName', label: 'Bank Name' }, { key: 'bankAccountLast4', label: 'Bank Account Last 4' }, { key: 'routingLast4', label: 'Routing Last 4' },
  { key: 'uniformSize', label: 'Uniform Size' }, { key: 'equipmentIssued', label: 'Equipment Issued' }, { key: 'licenses', label: 'Licenses' },
  { key: 'certifications', label: 'Certifications' }, { key: 'trainingRequired', label: 'Training Required' }, { key: 'performanceRating', label: 'Performance Rating' },
  { key: 'mfaEnabled', label: 'MFA Enabled' }, { key: 'lastPasswordChange', label: 'Last Password Change', type: 'date' }, { key: 'status', label: 'Status' },
];

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [profile, setProfile] = useState<EmployeeProfile>(emptyProfile);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [doc, setDoc] = useState({ title: '', category: 'General', description: '', url: '' });

  const load = async () => {
    const [usersRes, docsRes] = await Promise.all([
      fetch('/api/admin/users', { credentials: 'include' }),
      fetch('/api/admin/documents', { credentials: 'include' }),
    ]);
    const usersData = await usersRes.json();
    const docsData = await docsRes.json();
    setUsers(usersData.users || []);
    setDocuments(docsData.documents || []);
  };
  useEffect(() => { void load(); }, []);

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/users', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role: 'employee', profile }) });
    setProfile(emptyProfile); setEmail(''); setPassword(''); void load();
  };

  const addDocument = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/documents', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc) });
    setDoc({ title: '', category: 'General', description: '', url: '' });
    void load();
  };

  const removeDocument = async (id: string) => {
    await fetch(`/api/admin/documents/${id}`, { method: 'DELETE', credentials: 'include' });
    void load();
  };

  return <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
    <h1 className="text-3xl font-black">HR Administration & Documents</h1>

    <section className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-bold mb-2">Create employee profile (long form)</h2>
      <p className="text-sm text-gray-500 mb-4">Complete all HR fields before creating the account.</p>
      <form onSubmit={createUser} className="grid md:grid-cols-2 gap-3">
        <input className="border rounded p-2" placeholder="Employee login email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Temporary password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        {profileFields.map((field) => <input key={field.key} className="border rounded p-2" placeholder={field.label} type={field.type || 'text'} value={profile[field.key]} onChange={(e)=>setProfile({ ...profile, [field.key]: e.target.value })} />)}
        <button className="bg-blue-600 text-white rounded p-3 font-bold md:col-span-2">Create employee account</button>
      </form>
    </section>

    <section className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-bold mb-4">Publish internal document</h2>
      <form onSubmit={addDocument} className="grid md:grid-cols-2 gap-3">
        <input className="border rounded p-2" placeholder="Title" value={doc.title} onChange={(e)=>setDoc({...doc,title:e.target.value})} />
        <input className="border rounded p-2" placeholder="Category" value={doc.category} onChange={(e)=>setDoc({...doc,category:e.target.value})} />
        <input className="border rounded p-2 md:col-span-2" placeholder="Description" value={doc.description} onChange={(e)=>setDoc({...doc,description:e.target.value})} />
        <input className="border rounded p-2 md:col-span-2" placeholder="Secure URL (example: /docs/handbook-v2)" value={doc.url} onChange={(e)=>setDoc({...doc,url:e.target.value})} />
        <button className="bg-gray-900 text-white rounded p-3 font-bold md:col-span-2">Add document</button>
      </form>
    </section>

    <section className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-bold mb-4">Employees ({users.length})</h2>
      <div className="space-y-2">{users.map(u => <div key={u.id} className="p-3 border rounded flex justify-between"><span>{u.profile.firstName} {u.profile.lastName} · {u.profile.jobTitle}</span><span className="text-sm text-gray-500">{u.email} - {u.role}</span></div>)}</div>
    </section>

    <section className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-bold mb-4">Documents ({documents.length})</h2>
      <div className="space-y-2">{documents.map(d => <div className="p-3 border rounded flex justify-between" key={d.id}><span>{d.title} · {d.category}</span><button onClick={() => removeDocument(d.id)} className="text-red-600 font-semibold">Delete</button></div>)}</div>
    </section>
  </div>;
}
