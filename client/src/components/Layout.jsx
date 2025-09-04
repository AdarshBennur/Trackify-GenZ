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

// Responsive Page Header Component
const PageHeader = ({ title, subtitle, actions, className = '' }) => (
  <div className={`mb-6 md:mb-8 ${className}`}>
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm md:text-base text-[#A0A0A0] max-w-4xl">
            {subtitle}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex-shrink-0">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            {actions}
          </div>
        </div>
      )}
    </div>
  </div>
);

const Layout = ({ children, fullWidth = false, pageTitle, pageSubtitle, pageActions }) => {
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
              {/* Optional page header for full width pages */}
              {pageTitle && (
                <div className="bg-white border-b border-gray-200">
                  <div className="container-custom py-6 md:py-8">
                    <div className="px-4 sm:px-6 lg:px-8">
                      <PageHeader 
                        title={pageTitle}
                        subtitle={pageSubtitle}
                        actions={pageActions}
                      />
                    </div>
                  </div>
                </div>
              )}
              {children}
            </div>
          ) : (
            // Contained content with responsive padding
            <div className="container-custom py-6 md:py-8 lg:py-10">
              <div className="px-4 sm:px-6 lg:px-8">
                {/* Optional page header for contained pages */}
                {pageTitle && (
                  <PageHeader 
                    title={pageTitle}
                    subtitle={pageSubtitle}
                    actions={pageActions}
                  />
                )}
                {children}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

// Export both the Layout and PageHeader for flexible use
export default Layout;
export { PageHeader }; 