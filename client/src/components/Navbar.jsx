import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, LogOut, User, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="nav-brand">
          <MessageSquare className="brand-icon" size={24} />
          <span>ThinkSpace</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/create" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>
                New Post
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                  <Shield size={18} /> Admin
                </Link>
              )}
              <div className="user-menu">
                <span className="user-greeting">
                  <User size={18} /> {user.username}
                </span>
                <button onClick={handleLogout} className="btn-icon">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
