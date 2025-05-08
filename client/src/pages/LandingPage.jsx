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
      {/* Header */}
      <header className="bg-[#F8F6F0] shadow-sm">
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
                  <motion.span className="text-white font-bold text-xl">$</motion.span>
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
      </header>

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

        <div className="container-custom py-24 sm:py-32 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center lg:text-left lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Take Control of Your <span className="text-[#2E8B57]">Financial Life</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-[#A0A0A0]">
                  Trackify GenZ helps you monitor your spending, set budgets, and achieve your
                  financial goals with an easy-to-use interface.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-16 w-full max-w-lg mx-auto"
              >
                <div className="aspect-w-16 aspect-h-9 rounded-2xl bg-[#F8F6F0] shadow-lg overflow-hidden p-8 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, 0, -10, 0],
                      scale: [1, 1.1, 1, 1.1, 1] 
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="relative w-40 h-40"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-[#D4AF37] opacity-20"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-[#D4AF37] opacity-40"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-[#2E8B57]">
                      <span className="flex items-center">
                        <span className="text-[#D4AF37]">$</span>
                        <span>T</span>
                      </span>
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
                  className="bg-white p-8 rounded-xl shadow-sm border border-[#F4F1EB] flex flex-col"
                >
                  <dt className="text-lg font-semibold leading-7 text-gray-900">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-[#A0A0A0]">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
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
  );
};

export default LandingPage; 