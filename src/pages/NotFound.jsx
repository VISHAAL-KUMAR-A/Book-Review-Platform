import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
          <Link to="/books" className="btn btn-secondary">
            Browse Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
