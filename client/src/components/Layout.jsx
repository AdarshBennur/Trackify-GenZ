import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

const Layout = ({ children, fullWidth = false }) => {
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <motion.div 
        className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'}`}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
      >
        {fullWidth ? (
          children
        ) : (
          <div className="container-custom py-6 md:py-10">
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Layout; 