import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { SERVICES } from '../constants';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement;
    const update = () => setHeaderHeight(header?.offsetHeight || 0);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'SERVICES', path: '/services', hasDropdown: true },
    { name: 'CONTACT', path: '/contact' },
    { name: 'REQUEST QUOTE', path: '/contact', isButton: true },
    { name: user ? 'EMPLOYEE SPACE' : 'EMPLOYEE LOGIN', path: user ? '/employee' : '/employee/login' },
  ];

  return <nav ref={navRef} className="bg-gray-900 text-white sticky z-40 shadow-lg" style={{ top: `${headerHeight}px` }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="hidden md:flex items-center space-x-8 w-full justify-center">
          {navItems.map((item) => <div key={item.name} className="relative group">
            {item.hasDropdown ? <div className="flex items-center gap-1 py-4 px-2 text-sm font-bold tracking-widest cursor-pointer hover:text-blue-400" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>{item.name}<ChevronDown className="w-4 h-4" />
              {isServicesOpen && <div className="absolute top-full left-0 w-80 bg-white text-gray-900 shadow-2xl rounded-b-lg overflow-hidden border-t-2 border-blue-600">{SERVICES.map((service) => <Link key={service.id} to={`/services#${service.id}`} className="block px-4 py-3 text-xs font-bold hover:bg-blue-50" onClick={() => setIsServicesOpen(false)}>{service.title.toUpperCase()}</Link>)}</div>}
            </div> : <Link to={item.path} className={cn('py-4 px-2 text-sm font-bold tracking-widest transition-colors', item.isButton ? 'bg-blue-600 hover:bg-blue-700 px-6 rounded-md ml-4' : 'hover:text-blue-400', location.pathname === item.path && !item.isButton && 'text-blue-400 border-b-2 border-blue-400')}>{item.name}</Link>}
          </div>)}
          {user && <button onClick={logout} className="text-xs text-red-300 hover:text-red-100 font-bold">LOGOUT</button>}
        </div>
        <div className="md:hidden flex items-center justify-between w-full"><span className="font-bold tracking-widest text-sm">PSG SECURITY</span><button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-800">{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button></div>
      </div>
    </div>
  </nav>;
}
