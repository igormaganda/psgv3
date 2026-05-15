import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, FileText, Shield, Activity, Clock, LogOut, AlertCircle, LayoutDashboard, Check } from 'lucide-react';
import UserManagement from '../../components/admin/UserManagement';
import DocumentManagement from '../../components/admin/DocumentManagement';
import ChangeRequestApproval from '../../components/admin/ChangeRequestApproval';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDocuments: number;
  activeAdmins: number;
  recentActivity: number;
}

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  createdAt: Date;
  user: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'users' | 'documents' | 'audit' | 'approvals';

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalDocuments: 0,
    activeAdmins: 0,
    recentActivity: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [passwordDaysLeft, setPasswordDaysLeft] = useState<number>(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('psg_admin_token');

      // Fetch user data first
      const meResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        setPasswordDaysLeft(meData.passwordDaysLeft);
      }

      // Fetch users count
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const employees = usersData.users.filter((u: any) => u.role === 'employee');
        const admins = usersData.users.filter((u: any) => u.role === 'admin');

        setStats({
          totalEmployees: employees.length,
          activeEmployees: employees.filter((u: any) => u.active).length,
          totalDocuments: 0, // Will be fetched separately
          activeAdmins: admins.filter((u: any) => u.active).length,
          recentActivity: 0
        });
      }

      // Fetch documents count
      const docsResponse = await fetch('/api/admin/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setStats(prev => ({ ...prev, totalDocuments: docsData.documents.length }));
      }

      // Fetch recent activity
      const auditResponse = await fetch('/api/admin/audit-log?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setRecentActivity(auditData.logs || auditData.entries || []);
        setStats(prev => ({ ...prev, recentActivity: (auditData.logs || auditData.entries || []).length }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      const token = localStorage.getItem('psg_admin_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user.create': return '🟢';
      case 'user.update': return '🔵';
      case 'user.delete': return '🔴';
      case 'document.upload': return '🟠';
      case 'document.delete': return '🔴';
      case 'login': return '⚪';
      case 'logout': return '⚪';
      case 'password.change': return '🟣';
      default: return '⚪';
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Protection Security Group</p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Password Expiry Warning */}
      {passwordDaysLeft >= 0 && passwordDaysLeft <= 30 && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            passwordDaysLeft <= 0 ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-amber-50 border border-amber-200 text-amber-700'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                {passwordDaysLeft <= 0 ? 'Password Expired' : `Password expires in ${passwordDaysLeft} days`}
              </p>
              <p className="text-sm">
                {passwordDaysLeft <= 0 ? 'Please change your password immediately.' : 'Please change your password soon.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex gap-4 px-6" aria-label="Tabs">
              {[
                { key: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
                { key: 'users' as TabType, label: 'Users', icon: Users },
                { key: 'documents' as TabType, label: 'Documents', icon: FileText },
                { key: 'audit' as TabType, label: 'Audit Log', icon: Activity },
                { key: 'approvals' as TabType, label: 'Approvals', icon: Check }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
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
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Active Employees"
                value={stats.activeEmployees}
                icon={Users}
                color="green"
              />
              <StatCard
                title="Documents"
                value={stats.totalDocuments}
                icon={FileText}
                color="amber"
              />
              <StatCard
                title="Active Admins"
                value={stats.activeAdmins}
                icon={Shield}
                color="purple"
              />
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                <Activity className="w-5 h-5 text-slate-500" />
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-lg transition"
                    >
                      <span className="text-2xl">{getActionIcon(activity.action)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.user.profile?.firstName && activity.user.profile?.lastName
                            ? `${activity.user.profile.firstName} ${activity.user.profile.lastName}`
                            : activity.user.email}
                        </p>
                        <p className="text-sm text-slate-600">{activity.details || activity.action}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {getRelativeTime(activity.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}

        {activeTab === 'users' && <UserManagement />}

        {activeTab === 'documents' && <DocumentManagement />}

        {activeTab === 'audit' && (
          <AuditLogView />
        )}

        {activeTab === 'approvals' && (
          <ChangeRequestApproval />
        )}
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      <p className="text-sm text-slate-600 mt-1">{title}</p>
    </motion.div>
  );
}

interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string;
  createdAt: Date;
  user: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

function AuditLogView() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('psg_admin_token');

      const params = new URLSearchParams({ limit: '50' });
      if (filter) params.append('action', filter);

      const response = await fetch(`/api/admin/audit-log?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch audit logs');

      const data = await response.json();
      setLogs(data.logs || data.entries || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, { variant: any; label: string }> = {
      'user.create': { variant: 'success', label: 'User Created' },
      'user.update': { variant: 'info', label: 'User Updated' },
      'user.delete': { variant: 'error', label: 'User Deleted' },
      'document.upload': { variant: 'success', label: 'Document Uploaded' },
      'document.delete': { variant: 'error', label: 'Document Deleted' },
      'login': { variant: 'default', label: 'Login' },
      'logout': { variant: 'default', label: 'Logout' },
      'password.change': { variant: 'warning', label: 'Password Changed' }
    };
    return badges[action] || { variant: 'default', label: action };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Audit Log</h2>
        <p className="text-slate-600">View system activity and security events</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No audit activity found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const badge = getActionBadge(log.action);
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      <span className="text-sm text-slate-500">
                        {log.user.profile?.firstName && log.user.profile?.lastName
                          ? `${log.user.profile.firstName} ${log.user.profile.lastName}`
                          : log.user.email}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-slate-600 mb-1">{log.details}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(log.createdAt)}
                      </span>
                      {log.ipAddress && (
                        <span>IP: {log.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}