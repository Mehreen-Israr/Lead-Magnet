import React, { useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import '../animations.css';
import { useScrollProgress } from '../hooks/useScrollAnimation';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const scrollProgress = useScrollProgress();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
  <Link to="/login" className="cta-button btn-hover-slide">Login</Link>
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
            <Link to="/login" className="mobile-cta-button" onClick={closeMobileMenu}>Login</Link>
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