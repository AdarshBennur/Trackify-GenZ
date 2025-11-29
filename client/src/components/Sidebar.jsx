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
import Logo from '../assets/logo/logo.svg';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Start closed on mobile
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const isAuthenticated = true; // Force true for demo

  const navigate = useNavigate();
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
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

  // Close sidebar when clicking on link (mobile only)
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

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
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#F8F6F0] shadow-sm border-b border-[#F4F1EB] z-50 flex items-center justify-between px-4">
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-sm text-[#A0A0A0] hover:text-[#2E8B57] hover:bg-[#F8F6F0] focus:outline-none transition-all duration-300"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Logo */}
        <Link to="/" className="flex items-center" onClick={handleLinkClick}>
          <img src={Logo} alt="CashHarbor Logo" className="h-8 w-8 mr-2" />
          <span className="text-2xl font-bold text-[#2E8B57]">
            Cash<span className="text-[#D4AF37]">Harbor</span>
          </span>
        </Link>

        {/* Mobile Profile Button */}
        <Link
          to="/profile"
          className="p-2 rounded-md text-[#A0A0A0] hover:text-[#2E8B57] hover:bg-[#F8F6F0] transition-all duration-300"
          onClick={handleLinkClick}
        >
          <UserCircleIcon className="h-6 w-6" />
        </Link>
      </div>

      {/* Mobile Overlay - close sidebar when clicking outside */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={classNames(
          // Position and size
          'fixed top-0 left-0 h-full w-64 bg-[#F8F6F0] shadow-lg border-r border-[#F4F1EB] z-45',
          // Mobile positioning (below header)
          'md:top-0',
          isMobile ? 'top-16' : 'top-0',
          // Transform for slide animation
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          // Transition
          'transition-transform duration-300 ease-in-out',
          // Flex layout
          'flex flex-col'
        )}
        style={{ height: isMobile ? 'calc(100vh - 4rem)' : '100vh' }}
      >
        {/* Desktop Logo - hidden on mobile */}
        <div className="hidden md:flex h-16 items-center px-6 border-b border-[#F4F1EB] bg-[#F8F6F0]">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="CashHarbor Logo" className="h-10 w-10 mr-3" />
            <span className="text-2xl font-bold text-[#2E8B57]">
              Cash<span className="text-[#D4AF37]">Harbor</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 pt-6 pb-4 overflow-y-auto">
          <div className="px-3 space-y-2">
            {navigationLinks.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={classNames(
                    // Base styles
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300',
                    // Active state
                    isActive
                      ? 'bg-[#F4F1EB] text-[#2E8B57] shadow-sm border border-[#E5E2DC]'
                      : 'text-[#A0A0A0] hover:bg-[#F4F1EB] hover:text-[#2E8B57] hover:shadow-sm',
                    // Focus styles
                    'focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-opacity-50'
                  )}
                >
                  <Icon
                    className={classNames(
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-300',
                      isActive
                        ? 'text-[#D4AF37]'
                        : 'text-[#A0A0A0] group-hover:text-[#D4AF37]'
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
          <Link
            to="/profile"
            onClick={handleLinkClick}
            className={classNames(
              // Base styles - same as navigation buttons
              'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300',
              // Active state - check if current path is /profile
              isActivePath('/profile')
                ? 'bg-[#F4F1EB] text-[#2E8B57] shadow-sm border border-[#E5E2DC]'
                : 'text-[#A0A0A0] hover:bg-[#F4F1EB] hover:text-[#2E8B57] hover:shadow-sm',
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-opacity-50'
            )}
          >
            <UserCircleIcon
              className={classNames(
                'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-300',
                isActivePath('/profile')
                  ? 'text-[#D4AF37]'
                  : 'text-[#A0A0A0] group-hover:text-[#D4AF37]'
              )}
            />
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className={classNames(
              // Base styles - same as navigation buttons
              'mt-2 group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300',
              // Hover styles - same as navigation buttons
              'text-[#A0A0A0] hover:bg-[#F4F1EB] hover:text-[#2E8B57] hover:shadow-sm',
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-opacity-50'
            )}
          >
            <svg
              className="mr-3 flex-shrink-0 h-5 w-5 text-[#A0A0A0] group-hover:text-[#D4AF37] transition-colors duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 