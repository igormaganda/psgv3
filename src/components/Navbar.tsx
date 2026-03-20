import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { SERVICES } from '../constants';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'SERVICES', path: '/services', hasDropdown: true },
    { name: 'CONTACT', path: '/contact' },
    { name: 'REQUEST QUOTE', path: '/contact', isButton: true },
  ];

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="hidden md:flex items-center space-x-8 w-full justify-center">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.hasDropdown ? (
                  <div 
                    className="flex items-center gap-1 py-4 px-2 text-sm font-bold tracking-widest cursor-pointer hover:text-blue-400 transition-colors"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4" />
                    
                    {isServicesOpen && (
                      <div className="absolute top-full left-0 w-72 bg-white text-gray-900 shadow-2xl rounded-b-lg overflow-hidden border-t-2 border-blue-600 animate-in fade-in slide-in-from-top-2 duration-200">
                        {SERVICES.map((service) => (
                          <Link
                            key={service.id}
                            to={`/services#${service.id}`}
                            className="block px-4 py-3 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-0"
                            onClick={() => setIsServicesOpen(false)}
                          >
                            {service.title.toUpperCase()}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "py-4 px-2 text-sm font-bold tracking-widest transition-colors",
                      item.isButton 
                        ? "bg-blue-600 hover:bg-blue-700 px-6 rounded-md ml-4" 
                        : "hover:text-blue-400",
                      location.pathname === item.path && !item.isButton && "text-blue-400 border-b-2 border-blue-400"
                    )}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="md:hidden flex items-center justify-between w-full">
            <span className="font-bold tracking-widest">PSG SECURITY</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-bold tracking-widest hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
                {item.hasDropdown && (
                  <div className="pl-4 space-y-1">
                    {SERVICES.map((service) => (
                      <Link
                        key={service.id}
                        to={`/services#${service.id}`}
                        className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
