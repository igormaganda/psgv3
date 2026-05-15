import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import LoginPage from './pages/employee/LoginPage';
import ForgotPasswordPage from './pages/employee/ForgotPasswordPage';
import DashboardPage from './pages/employee/DashboardPage';
import AdminPage from './pages/employee/AdminPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => window.scrollTo(0, 0), [pathname]); return null; }

function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10">Loading...</div>;
  if (!user) return <Navigate to="/employee/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/employee" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 bg-gray-50">
          <Header />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/employee/login" element={<LoginPage />} />
              <Route path="/employee/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/employee" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/employee/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
