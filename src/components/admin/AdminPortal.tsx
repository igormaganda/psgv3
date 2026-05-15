import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from '../../pages/admin/AdminLogin';
import AdminDashboard from '../../pages/admin/AdminDashboard';

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('psg_admin_token');
    const savedUser = localStorage.getItem('psg_admin_user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.role === 'admin') {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // If not admin, redirect to employee portal
          navigate('/portal');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    setLoading(false);
  }, [navigate]);

  const handleLogin = (token: string, userData: any) => {
    if (userData.role === 'admin') {
      localStorage.setItem('psg_admin_token', token);
      localStorage.setItem('psg_admin_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      // If employee tries to login to admin portal, redirect to employee portal
      localStorage.setItem('psg_employee_token', token);
      localStorage.setItem('psg_employee_user', JSON.stringify(userData));
      navigate('/portal');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('psg_admin_token');
    localStorage.removeItem('psg_admin_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}