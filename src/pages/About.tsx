import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Target, Award, Users, MessageSquare, ClipboardCheck, Briefcase, HeartHandshake, FileCheck, ShieldCheck } from 'lucide-react';

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
              <p className="text-lg text-gray-600 leading-relaxed mb-12">
                Protection Security Group LLC’s product is its staff of licensed, trained, and professional Security Officers and Special Event Officers that represent PSG at our clients’ locations and keep our clients, their staff, customers and guests safe and secure.
              </p>
              
              <h4 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                CUSTOM SECURITY PROGRAMS TO ADDRESS SPECIFIC NEEDS
              </h4>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-2xl">
                <p className="text-blue-900 font-bold text-xl italic">
                  "No two security assignments / locations are the same. We work with you to develop an effective and comprehensive security program designed to address your specific needs."
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://protectionsecuritygroup.com/img/protection.jpeg" 
                alt="Protection" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information Tabs Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold tracking-widest text-sm mb-4 uppercase">Our Excellence</h2>
            <h3 className="text-4xl font-black text-gray-900">HOW WE OPERATE</h3>
          </div>

          <TabsContainer />
        </div>
      </section>
    </div>
  );
}

function TabsContainer() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 'selection',
      title: 'STAFF SELECTION',
      icon: Users,
      content: (
        <div className="space-y-6">
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
        </div>
      )
    },
    {
      id: 'training',
      title: 'SECURITY TRAINING',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <p>
            All Security Officers in New York State are required to be trained and licensed prior to beginning 
            employment as required by the NYS Security Guard Act of 1992. This legislation requires finger printing, 
            and a background check performed by the New York State Department of State, Division of Licensing in 
            conjunction with the NYS Division of Criminal Justice Services. It also requires ongoing mandated training 
            requirements for Security Officers which include 8-hour Pre-Employment, 16 hours On the Job Training
            and an Annual 8-hour refresher course. All the training is classroom based and is performed by a Licensed 
            Security Instructor at a NYS Licensed School. Certificates of completion are required for their Security 
            License to be issued and continued.
          </p>
          <p>
            In addition to the required New York State Training, all PSG Security Officers are provided with detailed 
            site-specific training and Post Orders/Instructions upon assignment to a client location. Both the training 
            and Post Orders/Instructions are developed by PSG Operations and Administrative staff and are 
            comprised of information obtained from client handbooks, information received through the results of 
            discussions with client management detailing their specific needs and requirements and general 
            operating procedures utilized in the security industry.
          </p>
          <p>
            The Post Orders/Instructions are then provided to each Security Officer assigned to the client’s locations. 
            Operations managers and Supervisors then provide individual instruction and review of the Post 
            Orders/Instructions to ensure that each Security Officer has a full understanding of their content and can 
            perform the required functions described in a professional and consistent manner.
          </p>
          <p>
            Post Orders/Instructions are reviewed both annually and on an as-needed basis and are adjusted and
            amended to meet changing needs and situations that arise.
          </p>
        </div>
      )
    },
    {
      id: 'customer',
      title: 'CUSTOMER SERVICE',
      icon: HeartHandshake,
      content: (
        <div className="space-y-6">
          <p>
            PSG places a high value on how vitally important our clients’ customers, staff, guests and vendors are to 
            their business. We fully understand the need for each PSG Security Officer to represent our clients in a 
            welcoming, professional and respectful manner to all those entering and exiting the client’s location while 
            performing their duties.
          </p>
          <p>
            When an individual enters a client’s location, usually the first representative of our client’s business, they 
            encounter is the PSG Security Officer, and the last representative of our client they see as they exit as 
            well. PSG Security Officers are attired, at most locations, in a black business suit, crisp and clean white 
            shirt and tie. Their only identification as an employee of PSG it the ¾ inch company lapel pin worn on the 
            left lapel of their suit jacket. Anyone entering or exiting the location only knows that the first and last person 
            they see is the business Security Officer.
          </p>
          <p>
            First and last impressions count and no matter how great the experience that was had while inside the 
            client location for shopping, meetings or delivering a package, that is the experience and impression that 
            they will remember, and we make sure that it is a good and lasting memory.
          </p>
          <p>
            All PSG Security Officers are trained and instructed and continually reminded to greet anyone entering
            or exiting with either a verbal welcome/good-bye (depending on client instructions) or via eye contact
            and at the very least a nod of the head and a smile. This small gesture will give notice that they are in a
            friendly and most importantly, in a safe environment monitored by a professional Security Officer
          </p>
        </div>
      )
    },
    {
      id: 'supervision',
      title: 'SUPERVISION',
      icon: ClipboardCheck,
      content: (
        <div className="space-y-6">
          <p>
            All of PSG’s Supervisors, Operations Managers and Executive staff have worked as a Security Officer at
            various types of client locations prior to taking the next upward step in their careers. This direct work
            experience of being in a post have allowed them to understand the concerns, issues, situations and
            resolution to these conditions that the client and the Security Officers they oversee experience daily. They
            have the ability via their training, work experience and client expectations to address and provide guidance
            and instruction to Security Officer and client alike.
          </p>
          <p>
            At client locations that have a full-time Supervisor assigned, the Supervisor has the additional 
            responsibility of being the liaison between client and Security Officer. They interact with the client daily 
            and at times hourly so open communication exists to receive instructions and react to conditions and 
            situations and ensure that all necessary updates are received by the security team. They also have the 
            responsibility for basic administrative duties, reviewing reports and alerts and logbook entries etc. 
            Providing constant updates to site training and performance is a core responsibility as well.
          </p>
        </div>
      )
    },
    {
      id: 'management',
      title: 'ACCOUNT MANAGEMENT',
      icon: Briefcase,
      content: (
        <div className="space-y-6">
          <p>
            An Operations Manager is assigned to each client location. The Operations Manager is the direct 
            primary contact between the client and all levels of PSG. They meet with clients on a regular basis to 
            review their needs and staff performance. They also make unannounced site visits to monitor the 
            Security Officers assigned at the location. 
          </p>
          <p>
            As a local area security provider our turnover rate at all levels of staff and management are very low with 
            a high retention rate. This contrasts with national and regional security companies that have a high level 
            of Account Management and staff turnover. PSG clients are always able to contact the same Operations 
            Manager initially assigned to their account on a long-term reliable basis. This is a very important resource 
            to our clients that large corporate owned nation and regional security companies cannot maintain.
          </p>
        </div>
      )
    },
    {
      id: 'licensing',
      title: 'LICENSING',
      icon: FileCheck,
      content: (
        <div className="space-y-6">
          <p>
            Protection Security Group LLC is licensed to operate by the New York State Department of State, Division
            of Licensing Services as a Watch Guard & Patrol Agency under license number 11000230143.
          </p>
        </div>
      )
    },
    {
      id: 'insurance',
      title: 'INSURANCE',
      icon: ShieldCheck,
      content: (
        <div className="space-y-6">
          <p>
            Protection Security Group LLC maintains General Liability Insurance for the following coverages
            amounts; Commercial General Liability Insurance of $1,000,000.00 per occurrence with a General
            Aggerate of $2,000,000.00. This includes coverage for Assault & Battery and Errors & Omissions. Certificates of 
            Insurance can be provided upon request. Additional coverage can be obtained if required by contract.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Tab Buttons */}
      <div className="lg:w-1/3 flex flex-col gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(index)}
            className={`flex items-center gap-4 p-6 rounded-2xl transition-all duration-300 text-left group ${
              activeTab === index
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-100'
            }`}
          >
            <div className={`p-3 rounded-xl transition-colors ${
              activeTab === index ? 'bg-white/20' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
            }`}>
              <tab.icon className="w-6 h-6" />
            </div>
            <span className="font-bold tracking-tight">{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="lg:w-2/3">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-gray-600 text-lg leading-relaxed text-justify"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-600 text-white p-4 rounded-2xl">
                  {(() => {
                    const Icon = tabs[activeTab].icon;
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>
                <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                  {tabs[activeTab].title}
                </h4>
              </div>
              {tabs[activeTab].content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
