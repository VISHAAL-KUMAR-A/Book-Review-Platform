import { formatDistanceToNow } from 'date-fns';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
  // Format the date to show how long ago the review was posted
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-user">
          <div className="review-avatar">
            {review.user.username.charAt(0).toUpperCase()}
          </div>
          <div className="review-user-info">
            <h4 className="review-username">{review.user.username}</h4>
            <span className="review-date">{timeAgo}</span>
          </div>
        </div>
        <div className="review-rating">
          {renderStars(review.rating)}
        </div>
      </div>
      <div className="review-content">
        <p className="review-text">{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard; 