import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, MapPin, Briefcase, DollarSign, Shield, Settings, FileText, Camera, Check, X, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/useToast';
import { FileUpload } from '../ui/FileUpload';

interface EmployeeProfile {
  id: string;
  userId: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  personalEmail?: string;
  workEmail?: string;
  phone?: string;
  workPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  ssnLast4?: string;
  workAuthorizationType?: string;
  workAuthorizationExpiry?: string;
  jobTitle?: string;
  department?: string;
  manager?: string;
  contractType?: string;
  employmentType?: string;
  hireDate?: string;
  probationEndDate?: string;
  workLocation?: string;
  shiftType?: string;
  weeklyHours?: number;
  payType?: string;
  basePay?: number;
  bonusEligible?: boolean;
  bankName?: string;
  bankAccountLast4?: string;
  routingLast4?: string;
  uniformSize?: string;
  equipmentIssued?: string;
  licenses?: string;
  certifications?: string;
  trainingRequired?: string;
  performanceRating?: number;
  photoUrl?: string;
  mfaEnabled?: boolean;
  status?: string;
}

interface ProfileManagementProps {
  userId: string;
  profile: EmployeeProfile;
  onUpdate: () => void;
  mode?: 'admin' | 'employee';
}

type TabType = 'basic' | 'contact' | 'employment' | 'pay' | 'equipment' | 'documents' | 'settings';

export default function ProfileManagement({ userId, profile, onUpdate, mode = 'admin' }: ProfileManagementProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<Partial<EmployeeProfile>>(profile);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (field: keyof EmployeeProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem(mode === 'admin' ? 'psg_admin_token' : 'psg_employee_token');

      if (mode === 'employee') {
        // Employee submits change request
        const changes = Object.keys(formData).filter(key => {
          const fieldValue = formData[key as keyof EmployeeProfile];
          const profileValue = profile[key as keyof EmployeeProfile];
          return JSON.stringify(fieldValue) !== JSON.stringify(profileValue);
        });

        for (const field of changes) {
          await fetch('/api/profile/change-request', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              field,
              oldValue: profile[field as keyof EmployeeProfile],
              newValue: formData[field as keyof EmployeeProfile]
            })
          });
        }

        toast.success('Success', 'Change requests submitted for approval');
      } else {
        // Admin updates directly
        const response = await fetch(`/api/admin/profile?userId=${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to update profile');

        // Upload photo if selected
        if (photoFile) {
          const photoFormData = new FormData();
          photoFormData.append('photo', photoFile);

          await fetch(`/api/admin/profile/photo?userId=${userId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: photoFormData
          });
        }

        toast.success('Success', 'Profile updated successfully');
      }

      setHasChanges(false);
      setPhotoFile(null);
      onUpdate();
    } catch (error) {
      toast.error('Error', error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'basic' as TabType, label: 'Basic Info', icon: User },
    { key: 'contact' as TabType, label: 'Contact', icon: MapPin },
    { key: 'employment' as TabType, label: 'Employment', icon: Briefcase },
    { key: 'pay' as TabType, label: 'Compensation', icon: DollarSign, adminOnly: true },
    { key: 'equipment' as TabType, label: 'Equipment', icon: Shield },
    { key: 'documents' as TabType, label: 'Documents', icon: FileText },
    { key: 'settings' as TabType, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header with Photo */}
      <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl p-6">
        <div className="flex items-end gap-6">
          {/* Photo Upload */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-white overflow-hidden border-4 border-white shadow-lg">
              {formData.photoUrl || photoFile ? (
                <img
                  src={photoFile ? URL.createObjectURL(photoFile) : formData.photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              )}
            </div>
            {mode === 'admin' && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 transition">
                <Camera className="w-4 h-4 text-slate-700" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setPhotoFile(e.target.files[0])}
                />
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-white pb-2">
            <h2 className="text-2xl font-bold">
              {formData.firstName} {formData.lastName}
            </h2>
            {formData.preferredName && (
              <p className="text-amber-100 text-sm">"{formData.preferredName}"</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm">
              {formData.employeeId && (
                <Badge variant="admin" className="bg-white/20 text-white border-white/30">
                  {formData.employeeId}
                </Badge>
              )}
              {formData.jobTitle && (
                <span className="text-amber-100">{formData.jobTitle}</span>
              )}
              {formData.department && (
                <span className="text-amber-100">• {formData.department}</span>
              )}
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData(profile);
                  setHasChanges(false);
                  setPhotoFile(null);
                }}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-white text-amber-600 hover:bg-amber-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 px-4 overflow-x-auto" aria-label="Profile tabs">
          {tabs.filter(tab => !tab.adminOnly || mode === 'admin').map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'basic' && <BasicInfoTab formData={formData} onChange={handleChange} mode={mode} />}
        {activeTab === 'contact' && <ContactTab formData={formData} onChange={handleChange} mode={mode} />}
        {activeTab === 'employment' && <EmploymentTab formData={formData} onChange={handleChange} mode={mode} />}
        {activeTab === 'pay' && <CompensationTab formData={formData} onChange={handleChange} mode={mode} />}
        {activeTab === 'equipment' && <EquipmentTab formData={formData} onChange={handleChange} mode={mode} />}
        {activeTab === 'documents' && <DocumentsTab userId={userId} mode={mode} />}
        {activeTab === 'settings' && <SettingsTab formData={formData} onChange={handleChange} mode={mode} />}
      </div>
    </div>
  );
}

// Tab Components
function BasicInfoTab({ formData, onChange, mode }: { formData: Partial<EmployeeProfile>, onChange: (field: keyof EmployeeProfile, value: any) => void, mode: 'admin' | 'employee' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FormField label="Employee ID" value={formData.employeeId} onChange={(v) => onChange('employeeId', v)} disabled={mode === 'employee'} />
      <FormField label="First Name" value={formData.firstName} onChange={(v) => onChange('firstName', v)} required />
      <FormField label="Last Name" value={formData.lastName} onChange={(v) => onChange('lastName', v)} required />
      <FormField label="Preferred Name" value={formData.preferredName} onChange={(v) => onChange('preferredName', v)} placeholder="Nickname" />
      <FormField label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(v) => onChange('dateOfBirth', v)} />
      <FormField label="Place of Birth" value={formData.placeOfBirth} onChange={(v) => onChange('placeOfBirth', v)} />
      <FormField label="Nationality" value={formData.nationality} onChange={(v) => onChange('nationality', v)} />
      <FormField label="Personal Email" type="email" value={formData.personalEmail} onChange={(v) => onChange('personalEmail', v)} />
      <FormField label="Work Email" type="email" value={formData.workEmail} onChange={(v) => onChange('workEmail', v)} />
      <FormField label="Phone" type="tel" value={formData.phone} onChange={(v) => onChange('phone', v)} />
      <FormField label="Work Phone" type="tel" value={formData.workPhone} onChange={(v) => onChange('workPhone', v)} />
    </div>
  );
}

function ContactTab({ formData, onChange, mode }: { formData: Partial<EmployeeProfile>, onChange: (field: keyof EmployeeProfile, value: any) => void, mode: 'admin' | 'employee' }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Address Line 1" value={formData.addressLine1} onChange={(v) => onChange('addressLine1', v)} className="md:col-span-2" />
          <FormField label="Address Line 2" value={formData.addressLine2} onChange={(v) => onChange('addressLine2', v)} className="md:col-span-2" />
          <FormField label="City" value={formData.city} onChange={(v) => onChange('city', v)} />
          <FormField label="State" value={formData.state} onChange={(v) => onChange('state', v)} />
          <FormField label="Postal Code" value={formData.postalCode} onChange={(v) => onChange('postalCode', v)} />
          <FormField label="Country" value={formData.country} onChange={(v) => onChange('country', v)} />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Contact Name" value={formData.emergencyContactName} onChange={(v) => onChange('emergencyContactName', v)} />
          <FormField label="Relationship" value={formData.emergencyContactRelation} onChange={(v) => onChange('emergencyContactRelation', v)} />
          <FormField label="Phone" type="tel" value={formData.emergencyContactPhone} onChange={(v) => onChange('emergencyContactPhone', v)} />
          <FormField label="Email" type="email" value={formData.emergencyContactEmail} onChange={(v) => onChange('emergencyContactEmail', v)} />
        </div>
      </div>
    </div>
  );
}

function EmploymentTab({ formData, onChange, mode }: { formData: Partial<EmployeeProfile>, onChange: (field: keyof EmployeeProfile, value: any) => void, mode: 'admin' | 'employee' }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Government & Authorization</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Government ID Type" value={formData.governmentIdType} onChange={(v) => onChange('governmentIdType', v)} disabled={mode === 'employee'} />
          <FormField label="Government ID Number" value={formData.governmentIdNumber} onChange={(v) => onChange('governmentIdNumber', v)} disabled={mode === 'employee'} />
          <FormField label="SSN Last 4" value={formData.ssnLast4} onChange={(v) => onChange('ssnLast4', v)} maxLength={4} disabled={mode === 'employee'} />
          <FormField label="Work Authorization Type" value={formData.workAuthorizationType} onChange={(v) => onChange('workAuthorizationType', v)} />
          <FormField label="Authorization Expiry" type="date" value={formData.workAuthorizationExpiry} onChange={(v) => onChange('workAuthorizationExpiry', v)} />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Employment Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Job Title" value={formData.jobTitle} onChange={(v) => onChange('jobTitle', v)} disabled={mode === 'employee'} />
          <FormField label="Department" value={formData.department} onChange={(v) => onChange('department', v)} disabled={mode === 'employee'} />
          <FormField label="Manager" value={formData.manager} onChange={(v) => onChange('manager', v)} disabled={mode === 'employee'} />
          <FormField label="Contract Type" value={formData.contractType} onChange={(v) => onChange('contractType', v)} disabled={mode === 'employee'} selectOptions={['Permanent', 'Fixed-Term', 'Freelance']} />
          <FormField label="Employment Type" value={formData.employmentType} onChange={(v) => onChange('employmentType', v)} disabled={mode === 'employee'} selectOptions={['Full-Time', 'Part-Time', 'Contract', 'Temporary']} />
          <FormField label="Hire Date" type="date" value={formData.hireDate} onChange={(v) => onChange('hireDate', v)} disabled={mode === 'employee'} />
          <FormField label="Probation End Date" type="date" value={formData.probationEndDate} onChange={(v) => onChange('probationEndDate', v)} disabled={mode === 'employee'} />
          <FormField label="Work Location" value={formData.workLocation} onChange={(v) => onChange('workLocation', v)} />
          <FormField label="Shift Type" value={formData.shiftType} onChange={(v) => onChange('shiftType', v)} selectOptions={['Day Shift', 'Night Shift', 'Rotating', 'Flexible']} />
          <FormField label="Weekly Hours" type="number" value={formData.weeklyHours} onChange={(v) => onChange('weeklyHours', parseFloat(v))} />
        </div>
      </div>
    </div>
  );
}

function CompensationTab({ formData, onChange, mode }: { formData: Partial<EmployeeProfile>, onChange: (field: keyof EmployeeProfile, value: any) => void, mode: 'admin' | 'employee' }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Compensation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Pay Type" value={formData.payType} onChange={(v) => onChange('payType', v)} selectOptions={['Hourly', 'Salary']} />
          <FormField label="Base Pay" type="number" value={formData.basePay} onChange={(v) => onChange('basePay', parseFloat(v))} />
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <input
              type="checkbox"
              id="bonus"
              checked={formData.bonusEligible || false}
              onChange={(e) => onChange('bonusEligible', e.target.checked)}
              className="w-4 h-4 text-amber-500"
            />
            <label htmlFor="bonus" className="text-sm text-slate-700">Bonus Eligible</label>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Banking Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Bank Name" value={formData.bankName} onChange={(v) => onChange('bankName', v)} />
          <FormField label="Account Last 4" value={formData.bankAccountLast4} onChange={(v) => onChange('bankAccountLast4', v)} maxLength={4} />
          <FormField label="Routing Last 4" value={formData.routingLast4} onChange={(v) => onChange('routingLast4', v)} maxLength={4} />
        </div>
      </div>
    </div>
  );
}

function EquipmentTab({ formData, onChange, mode }: { formData: Partial<EmployeeProfile>, onChange: (field: keyof EmployeeProfile, value: any) => void, mode: 'admin' | 'employee' }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Uniform Size</label>
          <select
            value={formData.uniformSize || ''}
            onChange={(e) => onChange('uniformSize', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          >
            <option value="">Select size</option>
            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Performance Rating</label>
          <select
            value={formData.performanceRating || ''}
            onChange={(e) => onChange('performanceRating', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            disabled={mode === 'employee'}
          >
            <option value="">Select rating</option>
            <option value="1">1 - Needs Improvement</option>
            <option value="2">2 - Meets Expectations</option>
            <option value="3">3 - Exceeds Expectations</option>
            <option value="4">4 - Outstanding</option>
            <option value="5">5 - Exceptional</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Issued</label>
        <textarea
          value={formData.equipmentIssued || ''}
          onChange={(e) => onChange('equipmentIssued', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
          placeholder="List equipment issued to employee..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Licenses</label>
        <textarea
          value={formData.licenses || ''}
          onChange={(e) => onChange('licenses', e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
          placeholder="Professional licenses..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Certifications</label>
        <textarea
          value={formData.certifications || ''}
          onChange={(e) => onChange('certifications', e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
          placeholder="CPR, First Aid, OSHA, etc..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Training Required</label>
        <textarea
          value={formData.trainingRequired || ''}
          onChange={(e) => onChange('trainingRequired', e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
          placeholder="Required training programs..."
        />
      </div>
    </div>
  );
}

function DocumentsTab({ userId, mode }: { userId: string, mode: 'admin' | 'employee' }) {
  return (
    <div className="text-center py-12 text-slate-500">
      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>Document management coming soon</p>
    </div>
  );
}

function SettingsTab({ formData, onChange, mode }: { formData: Partial<EmployeeProfile>, onChange: (field: keyof EmployeeProfile, value: any) => void, mode: 'admin' | 'employee' }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
        <div>
          <h4 className="font-medium text-slate-900">Two-Factor Authentication</h4>
          <p className="text-sm text-slate-600">Add an extra layer of security</p>
        </div>
        <Badge variant={formData.mfaEnabled ? 'success' : 'warning'}>
          {formData.mfaEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
        <div>
          <h4 className="font-medium text-slate-900">Account Status</h4>
          <p className="text-sm text-slate-600">Current employment status</p>
        </div>
        <Badge variant={formData.status === 'active' ? 'success' : 'error'}>
          {formData.status || 'Unknown'}
        </Badge>
      </div>
    </div>
  );
}

// Helper Component
function FormField({ label, value, onChange, type = 'text', selectOptions, required = false, disabled = false, maxLength, className = '' }: any) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {selectOptions ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          <option value="">Select {label.toLowerCase()}</option>
          {selectOptions.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <Input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          required={required}
        />
      )}
    </div>
  );
}
