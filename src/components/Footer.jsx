import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <h3 className="footer-title">BookHub</h3>
          <p className="footer-description">
            Your one-stop destination for discovering, reviewing, and discussing books.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li>
              <Link to="/" className="footer-link">Home</Link>
            </li>
            <li>
              <Link to="/books" className="footer-link">Books</Link>
            </li>
            <li>
              <Link to="/login" className="footer-link">Login</Link>
            </li>
            <li>
              <Link to="/register" className="footer-link">Register</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Contact</h3>
          <ul className="footer-links">
            <li>
              <a href="mailto:js3441813@gmail.com" className="footer-link">js3441813@gmail.com</a>
            </li>
            <li>
              <a href="tel:+1234567890" className="footer-link">+918838374400</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="footer-copyright">
            &copy; {currentYear} BookHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 