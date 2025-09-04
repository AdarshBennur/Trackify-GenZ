import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

const DashboardLayout = ({ children, fullWidth = false }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main 
        className={`
          ${isMobile ? 'pt-16' : 'md:ml-64'}
          min-h-screen
          transition-all duration-300 ease-in-out
        `}
      >
        <motion.div 
          className="w-full h-full"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
        >
          {fullWidth ? (
            // Full width content (no container)
            <div className="w-full">
              {children}
            </div>
          ) : (
            // Contained content with responsive padding
            <div className="container-custom py-6 md:py-8 lg:py-10">
              <div className="px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout; 