import React, { useState, useEffect } from 'react';
import { Heart, Menu, X, Shield, LogOut, User, UserPlus, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

/**
 * Renders the sticky application header. Features dynamic styling on scroll and responsive navigation.
 */
export const Header = ({ onOpenQRSetup }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  // State for toggling the mobile navigation menu visibility.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State to track if the page has been scrolled past a threshold.
  const [scrolled, setScrolled] = useState(false);
  // State for user dropdown menu
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Effect to manage header styling based on scroll position.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    // Cleanup function to remove the event listener.
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menu items - only show protected routes when authenticated
  const menuItems = [
    { label: 'Home', to: '/', public: true },
    { label: 'Chat', to: '/chat', protected: true },
    { label: 'Recommendations', to: '/recommendations', protected: true },
    { label: 'Subscriptions', to: '/subscriptions', public: true },
    { label: 'Contact', to: '/contact', public: true }
  ];

  // Filter menu items based on authentication
  const visibleMenuItems = menuItems.filter(item => {
    if (item.public) return true;
    if (item.protected) return isAuthenticated;
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    // Sticky header with conditional classes for scroll effect (backdrop blur, shadow).
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-md'} border-b border-pink-100`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Branding */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
            </div>
            <span className="text-xl font-bold text-pink-600">Heaven Match</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {visibleMenuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-gray-700 hover:text-pink-600 transition-colors font-medium relative group ${location.pathname === item.to ? 'text-pink-600' : ''}`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-600 transition-all ${location.pathname === item.to ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}
          </nav>
          
          {/* Action Buttons and Mobile Toggler */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* User Menu - Desktop (Authenticated) */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                      {user?.email || 'User'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                          <p className="text-xs text-gray-500">Account Settings</p>
                        </div>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenQRSetup && onOpenQRSetup();
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-pink-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-pink-600" />
                          <span className="text-sm text-gray-700">Setup 2FA (QR Code)</span>
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-50 transition-colors border-t border-gray-200 mt-1"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-700">Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Auth Buttons - Desktop (Not Authenticated) */}
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-pink-50 rounded-lg transition-colors"
            >
              {/* Conditional icon based on menu state */}
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Content: Conditionally rendered below the main header */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                {/* User Info - Mobile (Authenticated) */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500">Logged in</p>
                  </div>
                </div>

                {visibleMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-gray-700 hover:text-pink-600 py-2 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Actions (Authenticated) */}
                <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenQRSetup && onOpenQRSetup();
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-pink-50 transition-colors rounded-lg"
                  >
                    <Shield className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-gray-700">Setup 2FA</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-50 transition-colors rounded-lg"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Mobile Menu (Not Authenticated) */}
                {visibleMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-gray-700 hover:text-pink-600 py-2 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Auth Buttons (Not Authenticated) */}
                <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
