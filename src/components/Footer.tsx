import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-left">
          <div>
             <img 
              src="https://psg.mgd-crm.com/wp-content/uploads/2023/05/PSG-LOGO-300x169.png" 
              alt="PSG Logo" 
              className="h-16 w-auto mx-auto md:mx-0 brightness-0 invert"
              referrerPolicy="no-referrer"
            />
            <p className="mt-4 text-gray-400 text-sm">
              Providing dependable, professional comprehensive protection and security services.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold tracking-widest text-blue-400">CONTACT INFO</h3>
            <p className="text-sm text-gray-300">
              <span className="block font-bold text-white">Phone:</span>
              917.664.6201
            </p>
            <p className="text-sm text-gray-300">
              <span className="block font-bold text-white">Address:</span>
              41 Union Square West, New York, NY 10003
            </p>
            <p className="text-sm text-gray-300">
              <span className="block font-bold text-white">Email:</span>
              info@protectionsecuritygroup.com
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold tracking-widest text-blue-400">QUICK LINKS</h3>
            <ul className="text-sm space-y-2">
              <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="/services" className="hover:text-blue-400 transition-colors">Our Services</a></li>
              <li><a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            Copyright © {new Date().getFullYear()} PSGNY, All Rights Reserved
          </p>
          
          {isHome && (
            <div className="bg-blue-600 px-4 py-2 rounded text-[10px] font-bold tracking-widest uppercase">
              LICENSED BY THE NEW YORK STATE DEPARTMENT OF STATE DIVISION OF LICENSING SERVICES
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
