import { motion } from 'motion/react';
import Hero from '../components/Hero';
import { SERVICES } from '../constants';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Users, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <img 
              src="https://protectionsecuritygroup.com/img/Logo-psg.png" 
              alt="PSG Logo" 
              className="h-20 w-auto mx-auto mb-8"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight max-w-4xl mx-auto uppercase tracking-tight">
              Providing dependable, professional comprehensive protection and security services for the highest level of safety and security
            </h2>
            <p className="mt-6 text-xl text-gray-500 font-medium max-w-3xl mx-auto">
              Special Events, Retail Locations, Businesses, Individuals, Charitable Organizations and Cultural Institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Professional Protection', desc: 'Highest level of safety for all assignments.' },
              { icon: Users, title: 'Expert Staff', desc: 'Licensed, trained, and professional security officers.' },
              { icon: CheckCircle, title: 'Custom Programs', desc: 'Tailored security solutions for specific needs.' },
              { icon: Award, title: 'Licensed & Insured', desc: 'Fully licensed by the NY State Dept of State.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 skew-x-12 translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center lg:text-left">
            <h2 className="text-blue-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">PROTECTION SECURITY GROUP LLC MISSION STATEMENT</h2>
            <h3 className="text-4xl md:text-5xl font-black mb-12 leading-tight">
              OUR COMMITMENT TO EXCELLENCE
            </h3>
            <div className="space-y-8 text-gray-300 text-lg leading-relaxed text-justify">
              <p>
                Many security companies leave the initial selection and hiring of its Security Officers to a junior member 
                of their Human Resources department staff who may have little, if any, experience in the contract 
                security industry, and has been instructed to “fill the open post”. PSG has a different outlook on the 
                selection and hiring process of all its forward facing “in the field” staff. They are our “product” that we put 
                forth to our clients and this is our opportunity to provide the best person for the job. An opportunity that 
                only comes once for each new employee and PSG wants to get it right.
              </p>
              <p>
                All applicants for employment at PSG are initially interviewed by a Senior Operations or Executive staff 
                member who all have vast experience in the security industry. All of whom started out as entry level 
                Security Officers and have gained the knowledge and experience and have progressed to their current 
                positions based on knowing what is required to properly and professionally perform the job functions.
              </p>
              <p>
                When an applicant is interviewed by an Operations / Executive level staff member they evaluate the 
                applicant based on more than just the mind set of “will they show up on time for work”. They are being 
                evaluated by someone who has done the job and can determine if the applicant has the ability, integrity 
                and they are the right fit to work as part of the PSG Team and provide the high level of service that PSG 
                and its clients require. If at the conclusion of the interview they are offered employment, that is when 
                they are sent to Human Resources for the required paperwork because PSG cares about its clients and 
                ensures that they are getting the best “product” that can be provided.
              </p>
              <p>
                Protection Security Group LLC’s Executive and Senior Management Team has over 150 years of 
                combined experience in the security industry. They provide security services to some of the world’s best known companies in luxury retail, communications, lodging, entertainment and business and special 
                event communities. Protection Security Group LLC’s Executive and Senior Management Team are 
                committed to providing the highest level of security, safety and customer service to all our clients.
              </p>
              <div className="pt-8">
                <Link to="/about" className="inline-flex items-center gap-2 text-blue-500 font-bold hover:text-blue-400 transition-colors group">
                  LEARN MORE ABOUT OUR MISSION
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-blue-600 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Our Expertise</h2>
              <h3 className="text-4xl font-black text-gray-900">CORE SERVICES</h3>
            </div>
            <Link to="/services" className="hidden md:block text-blue-600 font-bold hover:underline">VIEW ALL SERVICES</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.slice(0, 3).map((service, i) => (
              <Link 
                key={service.id} 
                to={`/services#${service.id}`}
                className="group relative h-80 overflow-hidden rounded-2xl bg-gray-900"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
                   <img 
                    src={`https://protectionsecuritygroup.com/img/${service.id}.jpg`} 
                    alt={service.title} 
                    className="w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute bottom-0 left-0 p-8 z-20">
                  <h4 className="text-xl font-bold text-white mb-2">{service.title}</h4>
                  <p className="text-gray-300 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    {service.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/services" className="text-blue-600 font-bold hover:underline">VIEW ALL SERVICES</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
