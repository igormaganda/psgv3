import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { SERVICES } from '../constants';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    message: '',
    services: [] as string[]
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleServiceChange = (serviceTitle: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceTitle)
        ? prev.services.filter(s => s !== serviceTitle)
        : [...prev.services, serviceTitle]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          title: '',
          company: '',
          email: '',
          phone: '',
          location: '',
          message: '',
          services: []
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative py-24 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000" 
            alt="Contact Background" 
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
            CONTACT <span className="text-blue-600">US</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto font-medium"
          >
            We are here to answer any questions you may have about our security solutions.
          </motion.p>
        </div>
      </div>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-12">
              <div>
                <h2 className="text-blue-600 font-bold tracking-widest text-sm mb-6 uppercase">Get in Touch</h2>
                <h3 className="text-4xl font-black text-gray-900 mb-8">WE'D LOVE TO HEAR FROM YOU</h3>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600 font-medium">41 Union Square West, New York, NY 10003</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Phone Number</h4>
                    <p className="text-gray-600 font-medium">917.664.6201</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Email Address</h4>
                    <p className="text-gray-600 font-medium">info@protectionsecuritygroup.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Business Hours</h4>
                    <p className="text-gray-600 font-medium">24/7 Security Operations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-8 md:p-12 rounded-[3rem] border border-gray-100">
                {status === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-3xl font-black text-gray-900 mb-4">MESSAGE SENT!</h3>
                    <p className="text-lg text-gray-600 mb-8">
                      Thank you for contacting us. We will get back to you as soon as possible.
                    </p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black tracking-widest hover:bg-gray-900 transition-all"
                    >
                      SEND ANOTHER MESSAGE
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-bold">Failed to send message. Please try again later.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Name</label>
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Title</label>
                        <input 
                          type="text" 
                          value={formData.title}
                          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                          placeholder="Your Title"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Company Name</label>
                        <input 
                          type="text" 
                          value={formData.company}
                          onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email</label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                          placeholder="Email Address"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Phone</label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                          placeholder="Phone Number"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Location</label>
                        <input 
                          type="text" 
                          value={formData.location}
                          onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                          placeholder="Service Location"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">Type of services requested:</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SERVICES.map((service) => (
                          <label key={service.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.services.includes(service.title)}
                              onChange={() => handleServiceChange(service.title)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
                            />
                            <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{service.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Message</label>
                      <textarea 
                        required
                        rows={4}
                        value={formData.message}
                        onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        placeholder="Your Message"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-blue-600 text-white font-black tracking-[0.2em] py-5 rounded-2xl hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
