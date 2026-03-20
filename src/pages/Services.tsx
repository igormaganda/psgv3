import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { SERVICES } from '../constants';
import { Shield, ChevronRight } from 'lucide-react';

export default function Services() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-24 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=2000" 
            alt="Security Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
          >
            OUR <span className="text-blue-600">SERVICES</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto font-medium"
          >
            Comprehensive security solutions tailored to your specific needs.
          </motion.p>
        </div>
      </div>

      {/* Services List */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row scroll-mt-24"
              >
                <div className="lg:w-1/3 relative min-h-[300px]">
                  <img 
                    src={`https://picsum.photos/seed/${service.id}/800/600`} 
                    alt={service.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-blue-600/10" />
                </div>
                <div className="lg:w-2/3 p-10 md:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-600 p-3 rounded-xl text-white">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold tracking-widest hover:bg-blue-600 transition-colors flex items-center gap-2 group">
                      REQUEST INFO
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">READY TO SECURE YOUR LOCATION?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Contact us today for a comprehensive security assessment and custom program design.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-blue-600 px-12 py-5 rounded-2xl font-black tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            GET A FREE QUOTE
          </a>
        </div>
      </section>
    </div>
  );
}
