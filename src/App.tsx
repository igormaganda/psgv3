import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import AdminPortal from './components/admin/AdminPortal';
import EmployeePortal from './components/employee/EmployeePortal';
import { ToastProvider } from './context/ToastContext';
import { Toast } from './components/ui/Toast';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <Toast />
        <Routes>
        {/* Admin Portal - Admin access only */}
        <Route path="/portal/admin/*" element={<AdminPortal />} />

        {/* Employee Portal - Employee access */}
        <Route path="/portal/*" element={<EmployeePortal />} />

        {/* Main Site */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
            <Header />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  </ToastProvider>
  );
}
