import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { usersAPI, reviewsAPI } from '../services/api';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // With normalized user object, we can directly use user._id and user.token
        if (!user._id) {
          throw new Error('User ID is undefined. Please log in again.');
        }
        
        // Fetch user profile using the API service
        const profileData = await usersAPI.getUserProfile(user._id, user.token);
        setProfile(profileData);
        setFormData({
          username: profileData.username,
          email: profileData.email,
          bio: profileData.bio || ''
        });

        try {
          // Fetch user reviews using the API service
          const reviewsData = await reviewsAPI.getReviews({ userId: user._id });
          // No need to filter as the API now returns reviews by userId
          setUserReviews(reviewsData.reviews || []);
        } catch (reviewErr) {
          console.error('Error fetching reviews:', reviewErr);
          // Don't fail the whole profile load if reviews fail
          setUserReviews([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // With normalized user object, we can directly use user._id and user.token
      if (!user._id) {
        throw new Error('User ID is undefined. Please log in again.');
      }
      
      // Update user profile using the API service
      const updatedProfile = await usersAPI.updateUserProfile(user._id, formData, user.token);
      setProfile(updatedProfile);
      setIsEditing(false);
      setUpdateSuccess(true);
      setUpdateLoading(false);
    } catch (err) {
      setUpdateError(err.message);
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="centered-container">
        <LoadingSpinner size="large" />
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-username">{profile.username}</h1>
            <p className="profile-role">{profile.role}</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Profile Information</h2>
              {!isEditing && (
                <button
                  className="btn btn-secondary edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {updateSuccess && (
              <div className="success-message">
                Your profile has been updated successfully!
              </div>
            )}

            {updateError && (
              <div className="error-message">{updateError}</div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username:</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bio" className="form-label">Bio:</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>
                <div className="form-buttons">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <LoadingSpinner size="small" color="light" /> Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="profile-detail">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{profile.email}</span>
                </div>
                {profile.bio && (
                  <div className="profile-detail">
                    <span className="detail-label">Bio:</span>
                    <p className="detail-value bio">{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2 className="section-title">Your Reviews</h2>
            <div className="user-reviews">
              {userReviews.length === 0 ? (
                <p className="no-reviews">You haven't written any reviews yet.</p>
              ) : (
                userReviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 