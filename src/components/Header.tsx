import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img 
                src="https://protectionsecuritygroup.com/img/Logo-psg.png" 
                alt="Protection Security Group LLC" 
                className="h-24 w-auto"
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-full">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Email</p>
                <a href="mailto:info@protectionsecuritygroup.com" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  info@protectionsecuritygroup.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-full">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Address</p>
                <p className="font-bold text-gray-900">
                  41 Union Square West, New York, NY 10003
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-full">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Phone</p>
                <a href="tel:9176646201" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  917.664.6201
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
