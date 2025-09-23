import React, { useState} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';
import '../animations.css';
import { useScrollProgress } from '../hooks/useScrollAnimation';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const scrollProgress = useScrollProgress();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const handleSubscriptionsClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('/subscriptions');
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>
      
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img 
              src="/logo.png" 
              alt="LeadMagnet Logo" 
              className="navbar-logo-img"
            />
          </Link>
          
          <div className="navbar-right">
            <div className="navbar-menu">
              <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/about" className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}>
                About
              </Link>
              <Link to="/services" className={`navbar-link ${location.pathname === '/services' ? 'active' : ''}`}>
                Services
              </Link>
              <Link to="/why-choose-us" className={`navbar-link ${location.pathname === '/why-choose-us' ? 'active' : ''}`}>
                Why Choose Us
              </Link>
              <Link to="/contact" className={`navbar-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                Contact
              </Link>
            </div>
            
            <div className="navbar-cta">
              {isLoggedIn ? (
                <div className="profile-dropdown-container">
                  <button 
                    className="profile-button" 
                    onClick={toggleProfileDropdown}
                  >
                    <FaUserCircle className="profile-icon" />
                    <span className="profile-text">Account</span>
                    <FaChevronDown className={`dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`} />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="profile-dropdown">
                      <button 
                        className="dropdown-item" 
                        onClick={handleSubscriptionsClick}
                      >
                        See Subscribed Packages
                      </button>
                      <button 
                        className="dropdown-item logout" 
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="cta-button btn-hover-slide">Login</Link>
              )}
            </div>
          </div>
          
          <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <Link to="/" className={`mobile-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/about" className={`mobile-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={closeMobileMenu}>
              About
            </Link>
            <Link to="/services" className={`mobile-link ${location.pathname === '/services' ? 'active' : ''}`} onClick={closeMobileMenu}>
              Services
            </Link>
            <Link to="/why-choose-us" className={`mobile-link ${location.pathname === '/why-choose-us' ? 'active' : ''}`} onClick={closeMobileMenu}>
              Why Choose Us
            </Link>
            <Link to="/contact" className={`mobile-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={closeMobileMenu}>
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <button 
                  className="mobile-link" 
                  onClick={() => {
                    handleSubscriptionsClick();
                    closeMobileMenu();
                  }}
                >
                  See Subscribed Packages
                </button>
                <button 
                  className="mobile-link logout" 
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" className="mobile-cta-button" onClick={closeMobileMenu}>Login</Link>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
        )}
      </nav>
    </>
  );
};

export default Navbar;