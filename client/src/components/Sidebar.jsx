import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  HomeIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  FlagIcon,
  BellIcon,
  CurrencyYenIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  const isAuthenticated = true; // Force true for demo
  
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on small screens by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation links with icons
  const navigationLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'Income', href: '/income', icon: BanknotesIcon },
    { name: 'Expenses', href: '/expenses', icon: CurrencyDollarIcon },
    { name: 'Budget', href: '/budget', icon: DocumentChartBarIcon },
    { name: 'Goals', href: '/goals', icon: FlagIcon },
    { name: 'Reminders', href: '/reminders', icon: BellIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  ];

  // Check if the current path matches a navigation link
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile hamburger menu */}
      <div className="fixed top-0 left-0 z-50 md:hidden p-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-[#F8F6F0] shadow-luxe text-[#A0A0A0] hover:text-[#2E8B57] focus:outline-none transition-all duration-300"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile - close sidebar when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#1C2541] bg-opacity-20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={classNames(
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'h-screen flex flex-col fixed w-64 bg-[#F8F6F0] shadow-luxe border-r border-[#F4F1EB] z-40 transition-transform duration-300 ease-in-out'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#F4F1EB]">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-[#D4AF37] rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">₹</span>
            </div>
            <span className="text-xl font-bold text-[#2E8B57]">Trackify <span className="text-[#D4AF37]">GenZ</span></span>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="px-2 space-y-1">
            {navigationLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    isActivePath(item.href)
                      ? 'bg-[#F4F1EB] text-[#2E8B57] shadow-luxe'
                      : 'text-[#A0A0A0] hover:bg-[#F4F1EB] hover:text-[#2E8B57] hover:shadow-luxe',
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-300'
                  )}
                >
                  <Icon
                    className={classNames(
                      isActivePath(item.href) 
                        ? 'text-[#D4AF37]' 
                        : 'text-[#A0A0A0] group-hover:text-[#D4AF37]',
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-300'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* User Profile and Logout */}
        <div className="border-t border-[#F4F1EB] p-4">
          <Link to="/profile" className="flex items-center py-2 px-4 rounded-md hover:bg-[#F4F1EB] hover:shadow-luxe transition-all duration-300">
            <UserCircleIcon className="h-6 w-6 text-[#D4AF37] mr-3" />
            <span className="text-sm font-medium text-[#A0A0A0] hover:text-[#2E8B57] transition-colors duration-300">Profile</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="mt-2 flex items-center w-full py-2 px-4 rounded-md hover:bg-[#F4F1EB] hover:shadow-luxe transition-all duration-300"
          >
            <svg className="h-6 w-6 text-[#D4AF37] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium text-[#A0A0A0] hover:text-[#2E8B57] transition-colors duration-300">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 