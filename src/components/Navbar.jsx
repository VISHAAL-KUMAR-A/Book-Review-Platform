import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <h1>BookHub</h1>
        </Link>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className={`navbar-icon ${isMenuOpen ? 'open' : ''}`}></span>
        </div>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/books" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              Books
            </Link>
          </li>
          {user ? (
            <>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="btn btn-primary navbar-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="btn btn-primary navbar-btn" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 