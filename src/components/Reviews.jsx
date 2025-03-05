import React from "react";
import { format } from "date-fns";
import "./Reviews.css";

const Reviews = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p>No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className="reviews-container">
      {reviews.map((review) => (
        <div key={review._id} className="review-card">
          <div className="review-header">
            <span className="review-author">{review.user.username}</span>
            <span className="review-rating">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </span>
          </div>
          <p className="review-comment">{review.comment}</p>
          <div className="review-date">
            {format(new Date(review.createdAt), "MMM d, yyyy")}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
