import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  // For demo purposes, hardcode isAuthenticated to true
  const { user, logout } = useAuth();
  const isAuthenticated = true; // Force true for demo
  
  console.log("Navbar Auth Status:", { isAuthenticated, user });
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation links - show all links regardless of auth status
  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Income', href: '/income' },
    { name: 'Expenses', href: '/expenses' },
    { name: 'Budget', href: '/budget' },
    { name: 'Goals', href: '/goals' },
    { name: 'Reminders', href: '/reminders' },
    { name: 'Currencies', href: '/currencies' },
    { name: 'Search', href: '/search' },
  ];

  // Check if the current path matches a navigation link
  const isActivePath = (path) => {
    if (path.startsWith('/#')) {
      // For hash links like '/#features', just check if we're on the home page
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <Disclosure as="nav" className="bg-[#F8F6F0] shadow-luxe sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="flex items-center">
                    <div className="h-8 w-8 bg-[#D4AF37] rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-sm">$</span>
                    </div>
                    <span className="text-xl font-bold text-[#2E8B57]">Trackify <span className="text-[#D4AF37]">GenZ</span></span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigationLinks.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        isActivePath(item.href)
                          ? 'border-[#D4AF37] text-[#2E8B57]'
                          : 'border-transparent text-[#A0A0A0] hover:border-[#F4F1EB] hover:text-[#2E8B57]',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-all duration-300'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="border border-[#D4AF37] text-[#A0A0A0] hover:text-[#2E8B57] hover:shadow-luxe transition-all duration-300 px-4 py-2 rounded-md text-sm">
                    Profile
                  </Link>
                  <Link to="/login" className="bg-[#D4AF37] text-white hover:bg-opacity-90 hover:shadow-luxe-hover transition-all duration-300 px-4 py-2 rounded-md text-sm">
                    {isAuthenticated ? 'Log out' : 'Log in'}
                  </Link>
                </div>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-[#A0A0A0] hover:bg-[#F4F1EB] hover:text-[#2E8B57] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#D4AF37] transition-all duration-300">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigationLinks.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    isActivePath(item.href)
                      ? 'bg-[#F4F1EB] border-[#D4AF37] text-[#2E8B57]'
                      : 'border-transparent text-[#A0A0A0] hover:bg-[#F4F1EB] hover:border-[#D4AF37] hover:text-[#2E8B57]',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-all duration-300'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar; 