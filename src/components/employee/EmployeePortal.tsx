import { useState, useEffect } from 'react';
import EmployeeLogin from '../../pages/employee/EmployeeLogin';
import EmployeeDashboard from '../../pages/employee/EmployeeDashboard';

export default function EmployeePortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('psg_employee_token');
    const savedUser = localStorage.getItem('psg_employee_user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string, userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('psg_employee_token');
    localStorage.removeItem('psg_employee_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <EmployeeLogin onLogin={handleLogin} />;
  }

  return <EmployeeDashboard user={user} onLogout={handleLogout} />;
}