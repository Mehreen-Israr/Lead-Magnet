import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import '../animations.css';
import { useScrollProgress } from '../hooks/useScrollAnimation';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <path d="M20 20h60v60H20z" fill="#FFD700"/>
              <path d="M30 30h40v40H30z" fill="#1a1a1a"/>
              <path d="M40 40h20v20H40z" fill="#FFD700"/>
            </svg>
            <span>LeadMagnet</span>
          </Link>
          
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
            <button className="cta-button btn-hover-slide">Start Free Trial</button>
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
            <button className="mobile-cta-button" onClick={closeMobileMenu}>Start Free Trial</button>
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