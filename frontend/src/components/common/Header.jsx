import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import './Header.scss';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-icon">🚗</span>
            <span className="logo-text">Driving School</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/packages" className="nav-link">Packages</Link>
          
            <Link to="/contact" className="nav-link">Contact</Link>
            {isAuthenticated && (
              user?.user_type === 'admin' ? (
                <Link to="/dashboard/admin" className="nav-link">Admin</Link>
              ) : (
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              )
            )}
          </nav>

          {/* Auth Section */}
          <div className="auth-section">
              {isAuthenticated ? (
              <div className="user-menu">
                <Link to={'/profile'} className="logout-btn">
                  <FiUser />
                  <span>{user?.first_name || 'User'}</span>
                </Link>
                
                <button onClick={handleLogout} className="logout-btn">
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="nav-mobile">
            <Link to="/" className="nav-link" onClick={toggleMenu}>Home</Link>
            <Link to="/packages" className="nav-link" onClick={toggleMenu}>Packages</Link>
            
            <Link to="/contact" className="nav-link" onClick={toggleMenu}>Contact</Link>
            
            {isAuthenticated ? (
              <div className="mobile-auth">
                <Link to={user?.user_type === 'admin' ? '/dashboard/admin' : '/dashboard'} className="nav-link" onClick={toggleMenu}>{user?.user_type === 'admin' ? 'Admin' : 'Dashboard'}</Link>
                
                <button onClick={handleLogout} className="logout-btn-mobile">
                  <FiLogOut />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth">
                <Link to="/login" className="nav-link" onClick={toggleMenu}>Login</Link>
                <Link to="/register" className="nav-link" onClick={toggleMenu}>Sign Up</Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
