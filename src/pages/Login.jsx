import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { authAPI } from '../services/api';
import './Login.css';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Sending login data to API:', JSON.stringify({ email: formData.email, password: '***' }));
      
      // Use the API service to login
      const userData = await authAPI.login(formData);
      console.log('Login successful:', userData);
      
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update app state
      setUser(userData);
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Login</h1>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-control"
                required
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" color="light" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register" className="auth-link">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 