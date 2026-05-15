import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, FileText, LogOut, Settings, Briefcase, Phone, Mail, MapPin, Calendar, Building, Save, Lock, AlertCircle } from 'lucide-react';

interface EmployeeDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'documents'>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get profile
      const profileRes = await fetch('/api/employees/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('psg_employee_token')}`
        }
      });
      const profileData = await profileRes.json();
      setProfile(profileData.user);

      // Get documents
      const docsRes = await fetch('/api/employees/documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('psg_employee_token')}`
        }
      });
      const docsData = await docsRes.json();
      setDocuments(docsData.documents || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/employees/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('psg_employee_token')}`
        },
        body: JSON.stringify(profile.profile)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('psg_employee_token');
    localStorage.removeItem('psg_employee_user');
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Employee Portal</h1>
                <p className="text-sm text-slate-500">Protection Security Group</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">{profile?.email}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                Documents
              </button>
            </nav>
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Content */}
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={profile?.profile?.firstName || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        profile: { ...profile.profile, firstName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profile?.profile?.lastName || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        profile: { ...profile.profile, lastName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profile?.profile?.phone || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        profile: { ...profile.profile, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={profile?.profile?.addressLine1 || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        profile: { ...profile.profile, addressLine1: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                </div>
              </div>

              {/* Work Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Work Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-slate-500">Job Title</p>
                      <p className="font-medium">{profile?.profile?.jobTitle || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Building className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-slate-500">Department</p>
                      <p className="font-medium">{profile?.profile?.department || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-slate-500">Hire Date</p>
                      <p className="font-medium">
                        {profile?.profile?.hireDate ? new Date(profile.profile.hireDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center gap-3 transition">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center gap-3 transition">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span>My Documents</span>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700 mb-3">Contact HR or your manager for assistance.</p>
                <a href="mailto:hr@psg.com" className="text-sm text-blue-600 hover:text-blue-700">
                  hr@psg.com
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Company Documents</h2>
              <p className="text-sm text-slate-500 mt-1">Access company policies, forms, and resources</p>
            </div>
            <div className="p-6">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No documents available yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-slate-900">{doc.title}</p>
                          <p className="text-sm text-slate-500">{doc.category}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <PasswordChangeForm
              onClose={() => setShowPasswordChange(false)}
              onSuccess={() => {
                setShowPasswordChange(false);
                setMessage({ type: 'success', text: 'Password changed successfully' });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordChangeForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('psg_employee_token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}