import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Logo animation variants - static variants without animation
const logoVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.8
    }
  }
};

// Static variant for coin
const coinVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const LandingPage = () => {
  // Add useEffect to directly attach event handlers to buttons
  React.useEffect(() => {
    // Direct DOM manipulation to ensure button works
    setTimeout(() => {
      const bottomButton = document.getElementById('bottomTrackExpenseButton');
      
      if (bottomButton) {
        bottomButton.addEventListener('click', () => {
          window.location.replace('/dashboard');
        });
      }
      
      // Global click handler as final fallback
      document.addEventListener('click', (e) => {
        // Check if clicked element contains the relevant text
        if (e.target && e.target.textContent && 
            e.target.textContent.trim() === 'Track Your Expense') {
          console.log('Global click handler detected Track Your Expense button click');
          window.location.href = '/dashboard';
        }
      });
    }, 500); // Give time for DOM to render
  }, []);

  // Features section data
  const features = [
    {
      name: 'Track Expenses Easily',
      description:
        'Record and categorize your expenses with just a few clicks. Maintain a detailed log of where your money goes.',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Visualize Your Spending',
      description:
        'Get intuitive charts and graphs that break down your expenses by category, time period, and more.',
      icon: ChartBarIcon,
    },
    {
      name: 'Set & Monitor Budgets',
      description:
        'Create custom budgets for different expense categories and receive alerts when approaching limits.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Multi-Device Access',
      description:
        'Access your expense data from any device - desktop, tablet, or mobile with our responsive design.',
      icon: DevicePhoneMobileIcon,
    },
    {
      name: 'Secure & Private',
      description:
        'Your financial data is encrypted and secure. We prioritize your privacy and data security.',
      icon: UserGroupIcon,
    },
    {
      name: 'Regular Updates',
      description:
        'Our platform is constantly improving with new features and optimizations based on user feedback.',
      icon: ArrowPathIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Header - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F8F6F0] shadow-md z-50">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Name */}
            <div className="flex items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={logoVariants}
                className="h-10 w-10 mr-3 bg-[#D4AF37] rounded-full flex items-center justify-center overflow-hidden"
              >
                <motion.div variants={coinVariants} className="flex flex-col items-center">
                  <motion.span className="text-white font-bold text-xl">₹</motion.span>
                  <motion.div className="w-5 h-1 bg-white rounded-full mt-1"></motion.div>
                </motion.div>
              </motion.div>
              <span className="text-xl font-bold text-[#2E8B57]">Trackify <span className="text-[#D4AF37]">GenZ</span></span>
            </div>
            
            {/* Auth Links */}
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-[#A0A0A0] hover:text-gray-900 font-medium">
                Log in
              </Link>
              <Link to="/signup" className="bg-[#D4AF37] text-white px-4 py-2 rounded-md font-medium hover:bg-[#C39E2D] transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
        {/* Shadowed divider line */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent shadow-md"></div>
      </header>

      {/* Content padding to prevent overlap with fixed header */}
      <div className="pt-[73px]">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#F8F6F0] to-[#F4F1EB] overflow-hidden">
          <div className="absolute inset-0">
            <svg
              className="absolute right-0 bottom-0 transform translate-x-1/3 translate-y-1/2 lg:translate-x-1/2 xl:translate-y-1/5"
              width="404"
              height="404"
              fill="none"
              viewBox="0 0 404 404"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="85737c0e-0916-41d7-917f-596dc7edfa27"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x="0"
                    y="0"
                    width="4"
                    height="4"
                    className="text-[#D4AF37] opacity-20"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width="404"
                height="404"
                fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)"
              />
            </svg>
          </div>

          <div className="container-custom py-12 sm:py-16 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row items-center">
                {/* Left side: Text content */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-2xl md:w-1/2 text-center md:text-left"
                >
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    Take Control of Your <span className="text-[#2E8B57]">Financial Life</span>
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-[#A0A0A0]">
                    Trackify GenZ helps you monitor your spending, set budgets, and achieve your
                    financial goals with an easy-to-use interface.
                  </p>
                </motion.div>
                
                {/* Right side: Animated dashboard visualization */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mt-8 md:mt-0 md:w-1/2"
                >
                  <div className="relative mx-auto max-w-lg">
                    {/* Background decorative elements */}
                    <motion.div 
                      className="absolute -top-6 -right-6 w-32 h-32 bg-[#2E8B57] opacity-10 rounded-full"
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 6, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}  
                    />
                    <motion.div 
                      className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#D4AF37] opacity-10 rounded-full"
                      animate={{ 
                        scale: [1, 1.15, 1],
                      }}
                      transition={{ 
                        duration: 7, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}  
                    />
                    
                    {/* Dashboard visualization */}
                    <motion.div
                      className="relative bg-white rounded-2xl shadow-luxe overflow-hidden p-5"
                      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(212, 175, 55, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Dashboard header */}
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#2E8B57] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">₹</span>
                          </div>
                          <h3 className="ml-2 font-semibold text-gray-800">Financial Dashboard</h3>
                        </div>
                        <div className="flex space-x-2">
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-red-400"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-yellow-400"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                          />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-green-400" 
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                          />
                        </div>
                      </div>
                      
                      {/* Chart visualization */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Monthly Spending</h4>
                        <div className="h-32 flex items-end justify-between space-x-2">
                          {[35, 55, 40, 70, 60, 75, 65, 90, 75, 80, 95, 85].map((height, index) => (
                            <motion.div
                              key={index}
                              className="w-full bg-gradient-to-t from-[#2E8B57] to-[#D4AF37] rounded-t-sm"
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ 
                                duration: 1,
                                delay: index * 0.05,
                                ease: "easeOut"
                              }}
                            ></motion.div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>Jan</span>
                          <span>Apr</span>
                          <span>Jul</span>
                          <span>Dec</span>
                        </div>
                      </div>
                      
                      {/* Financial summary */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <motion.div 
                          className="bg-[#F8F6F0] p-3 rounded-lg"
                          whileHover={{ y: -2 }}
                        >
                          <p className="text-xs text-gray-500">Income</p>
                          <p className="text-lg font-semibold text-[#2E8B57]">₹5,240</p>
                          <motion.p 
                            className="text-xs text-green-500"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >+12.5%</motion.p>
                        </motion.div>
                        <motion.div 
                          className="bg-[#F8F6F0] p-3 rounded-lg"
                          whileHover={{ y: -2 }}
                        >
                          <p className="text-xs text-gray-500">Expenses</p>
                          <p className="text-lg font-semibold text-[#D4AF37]">₹3,120</p>
                          <motion.p 
                            className="text-xs text-red-500"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                          >-5.3%</motion.p>
                        </motion.div>
                        <motion.div 
                          className="bg-[#F8F6F0] p-3 rounded-lg"
                          whileHover={{ y: -2 }}
                        >
                          <p className="text-xs text-gray-500">Savings</p>
                          <p className="text-lg font-semibold text-purple-600">₹2,120</p>
                          <motion.p 
                            className="text-xs text-green-500"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                          >+18.2%</motion.p>
                        </motion.div>
                      </div>
                      
                      {/* Recent transactions */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Transactions</h4>
                        <motion.div 
                          className="flex justify-between py-2 border-b border-gray-100 items-center"
                          whileHover={{ x: 3 }}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center mr-2">
                              <span className="text-green-600 text-xs">↓</span>
                            </div>
                            <span className="text-xs">Salary Deposit</span>
                          </div>
                          <span className="text-xs font-medium text-green-600">+₹3,200</span>
                        </motion.div>
                        <motion.div 
                          className="flex justify-between py-2 border-b border-gray-100 items-center"
                          whileHover={{ x: 3 }}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center mr-2">
                              <span className="text-red-600 text-xs">↑</span>
                            </div>
                            <span className="text-xs">Rent Payment</span>
                          </div>
                          <span className="text-xs font-medium text-red-600">-₹1,500</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="bg-[#F8F6F0] py-24 sm:py-32">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to manage your finances
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#A0A0A0]">
                Our comprehensive suite of tools helps you track, analyze, and optimize your personal finances.
              </p>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24 lg:max-w-none"
            >
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <motion.div 
                    key={feature.name} 
                    variants={itemVariants}
                    className="bg-white p-8 rounded-xl shadow-md border border-[#F4F1EB] flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                    whileHover={{ 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {/* Gold accent line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#F5E7A3]"></div>
                    
                    {/* Background decorative element */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#F8F6F0] opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    
                    <dt className="text-lg font-semibold leading-7 text-gray-900 flex items-center">
                      <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C39E2D] shadow-inner">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-[#2E8B57] rounded-full"></div>
                      </div>
                    </dt>
                    
                    <dt className="text-xl font-bold leading-7 text-gray-900 mb-3">
                      {feature.name}
                    </dt>
                    
                    <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-[#A0A0A0]">
                      <p className="flex-auto">{feature.description}</p>
                      <div className="mt-4 h-0.5 w-12 bg-gradient-to-r from-[#2E8B57] to-transparent rounded-full"></div>
                    </dd>
                    
                    {/* Subtle hover effect indicator */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="h-5 w-5 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#2E8B57] py-16 sm:py-24">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start tracking your expenses today
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#F8F6F0] opacity-90">
                Join thousands of users who have already taken control of their finances.
                Start your journey to financial clarity.
              </p>
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  id="bottomTrackExpenseButton"
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-[#D4AF37] text-white hover:bg-[#C39E2D] py-3 px-8 text-lg font-semibold rounded-lg shadow-lg transition-all cursor-pointer"
                >
                  Track Your Expense
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage; 