import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    image: 'https://psg.mgd-crm.com/wp-content/uploads/2023/05/PSG-SLIDER-1.jpg',
    title: 'WE PROVIDE SOLUTIONS',
    subtitle: 'NOT ONLY SECURITY SERVICES',
    extra: 'CUSTOM PROGRAMS DESIGNED FOR SPECIFIC NEEDS',
    buttonText: 'CONTACT US',
    buttonLink: '/contact'
  },
  {
    id: 2,
    image: 'https://psg.mgd-crm.com/wp-content/uploads/2023/05/PSG-SLIDER-2.jpg',
    title: 'EXCEEDING YOUR EXPECTATIONS',
    subtitle: 'IS OUR MISSION',
    buttonText: 'CONTACT US',
    buttonLink: '/contact'
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[600px] overflow-hidden bg-gray-900">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl text-white">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-2"
              >
                {slides[current].title}
              </motion.h2>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-600 inline-block px-4 py-2 text-2xl md:text-4xl font-black mb-6"
              >
                {slides[current].subtitle}
              </motion.div>
              
              {slides[current].extra && (
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl md:text-2xl font-bold tracking-widest mb-8 text-gray-100"
                >
                  {slides[current].extra}
                </motion.p>
              )}
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Link 
                  to={slides[current].buttonLink}
                  className="inline-block bg-white text-gray-900 px-8 py-4 font-bold tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 rounded-sm"
                >
                  {slides[current].buttonText}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-blue-600 w-8' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
