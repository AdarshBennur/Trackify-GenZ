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

const Home = () => {
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
      name: 'Regular Updates',
      description:
        'Our platform is constantly improving with new features and optimizations based on user feedback.',
      icon: ArrowPathIcon,
    },
    {
      name: 'Accessible Anywhere',
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
  ];

  // Testimonials data
  const testimonials = [
    {
      content:
        "ExpenseTracker has completely changed how I manage my finances. I can now easily see where my money is going and make better financial decisions.",
      author: 'Sarah Johnson',
      role: 'Marketing Professional',
    },
    {
      content:
        "I've tried several expense tracking apps, but this one stands out for its beautiful interface and ease of use. It's become an essential part of my financial routine.",
      author: 'Michael Chen',
      role: 'Software Engineer',
    },
    {
      content:
        "The budget feature has helped me save an extra $300 each month. I finally feel in control of my spending and more confident about my financial future.",
      author: 'Emily Rodriguez',
      role: 'Small Business Owner',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-50 to-secondary-50 overflow-hidden">
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
                  className="text-accent-200"
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
          <svg
            className="absolute left-0 top-0 transform -translate-x-1/2 -translate-y-1/2 lg:-translate-x-1/4 xl:-translate-y-1/4"
            width="404"
            height="404"
            fill="none"
            viewBox="0 0 404 404"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="85737c0e-0916-41d7-917f-596dc7edfa28"
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
                  className="text-primary-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width="404"
              height="404"
              fill="url(#85737c0e-0916-41d7-917f-596dc7edfa28)"
            />
          </svg>
        </div>

        <div className="container-custom py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Take Control of Your <span className="text-primary-600">Financial Life</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  ExpenseTracker helps you monitor your spending, set budgets, and achieve your
                  financial goals with an easy-to-use interface.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link to="/dashboard" className="btn-primary">
                    Track Expense
                  </Link>
                  <Link to="/signup" className="btn-outline">
                    Get started for free
                  </Link>
                  <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 flex items-center">
                    Already have an account? <span aria-hidden="true" className="ml-1">→</span>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-w-16 aspect-h-9 rounded-2xl bg-white shadow-elegant-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
                    alt="ExpenseTracker Dashboard Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-white py-24 sm:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your finances
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
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
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.name} 
                  variants={itemVariants}
                  className="card p-8 flex flex-col"
                >
                  <dt className="text-lg font-semibold leading-7 text-gray-900">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by thousands
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Hear from our users who have transformed their financial lives with ExpenseTracker.
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {testimonials.map((testimonial) => (
              <motion.div 
                key={testimonial.author} 
                variants={itemVariants}
                className="card p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-x-3">
                    <div className="text-xl text-primary-600">"</div>
                    <p className="text-sm leading-6 text-gray-600">{testimonial.content}</p>
                    <div className="text-xl text-primary-600">"</div>
                  </div>
                </div>
                <div className="mt-8 border-t border-gray-100 pt-5">
                  <div className="flex items-center gap-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900">{testimonial.author.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.author}</h3>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16 sm:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start tracking your expenses today
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Join thousands of users who have already taken control of their finances.
              Sign up for free and start your journey to financial clarity.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-primary-50">
                Get started
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-white">
                Already have an account? <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 