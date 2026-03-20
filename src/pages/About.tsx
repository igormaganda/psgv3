import { motion } from 'motion/react';
import { Shield, Target, Award, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative py-24 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=2000" 
            alt="Background" 
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
            ABOUT <span className="text-blue-600">PSG</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto font-medium"
          >
            What sets Protection Security Group LLC apart from and ahead of other security companies.
          </motion.p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-blue-600 font-bold tracking-widest text-sm mb-4 uppercase">Our Quality</h2>
              <h3 className="text-4xl font-black text-gray-900 mb-8 leading-tight">
                A COMPANY IS KNOWN FOR THE QUALITY IT PRODUCES
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Protection Security Group LLC’s product is its staff of licensed, trained, and professional Security Officers and Special Event Officers that represent PSG at our clients’ locations and keep our clients, their staff, customers and guests safe and secure.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-2xl">
                <p className="text-blue-900 font-bold text-xl italic">
                  "No two security assignments / locations are the same. We work with you to develop an effective and comprehensive security program designed to address your specific needs."
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1000" 
                alt="Team Meeting" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl hidden md:block border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 text-white p-3 rounded-xl">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-900">150+</p>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Years Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Selection Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold tracking-widest text-sm mb-4 uppercase">Our Process</h2>
            <h3 className="text-4xl font-black text-gray-900">STAFF SELECTION & TRAINING</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <Users className="w-12 h-12 text-blue-600 mb-6" />
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Meticulous Hiring</h4>
              <p className="text-gray-600 leading-relaxed">
                PSG has a different outlook on the selection and hiring process. All applicants are initially interviewed by a Senior Operations or Executive staff member who all have vast experience in the security industry. They are evaluated by someone who has done the job and can determine if the applicant has the ability, integrity and they are the right fit.
              </p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <Shield className="w-12 h-12 text-blue-600 mb-6" />
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Rigorous Training</h4>
              <p className="text-gray-600 leading-relaxed">
                All Security Officers in New York State are required to be trained and licensed prior to beginning employment. In addition to the required NYS Training, all PSG Security Officers are provided with detailed site-specific training and Post Orders/Instructions upon assignment to a client location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Management Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-8">
                EXECUTIVE & SENIOR MANAGEMENT
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Our team has over 150 years of combined experience in the security industry. They provide security services to some of the world’s best-known companies in luxury retail, communications, lodging, entertainment and business and special event communities.
              </p>
              <ul className="space-y-4">
                {[
                  'Low turnover rate at all levels',
                  'Direct primary contact for clients',
                  'Unannounced site visits for monitoring',
                  'Long-term reliable account management'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-bold">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    {item.toUpperCase()}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 relative min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                alt="Office" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
