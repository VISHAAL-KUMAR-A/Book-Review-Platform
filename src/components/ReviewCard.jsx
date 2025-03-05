import { formatDistanceToNow } from "date-fns";
import "./ReviewCard.css";

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : "empty"}`}>
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
          </div>
        </div>
        <div className="review-rating">{renderStars(review.rating)}</div>
      </div>
      <div className="review-content">
        <p className="review-text">{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
