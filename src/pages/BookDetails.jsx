import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReviewCard from "../components/ReviewCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { booksAPI, reviewsAPI, googleBooksAPI } from "../services/api";
import "./BookDetails.css";
import Reviews from "../components/Reviews";

const BookDetails = ({ user, source }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [localBookId, setLocalBookId] = useState(null);

  // Determine the source based on the URL or prop
  // If we're on the legacy route, try to determine the source from the ID format
  const [bookSource, setBookSource] = useState(source);

  useEffect(() => {
    // If source is not provided via props, try to determine from the URL path
    if (!bookSource) {
      const path = window.location.pathname;
      if (path.includes("/books/google/")) {
        setBookSource("google");
      } else if (path.includes("/books/local/")) {
        setBookSource("local");
      } else {
        // Legacy URL - we'll need to guess based on ID format or redirect
        // For now, let's assume MongoDB IDs are 24 characters
        setBookSource(id.length === 24 ? "local" : "google");
      }
    }
  }, [id, bookSource, source]);

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      if (!bookSource) return;

      setLoading(true);
      setError(null);

      try {
        let bookData;

        if (bookSource === "google") {
          // Fetch Google Book data
          const googleBookData = await googleBooksAPI.getBookById(id);
          bookData = googleBooksAPI.formatBookData(googleBookData);
          setBook(bookData);

          // Check if this Google Book exists in our database
          try {
            const checkResult = await booksAPI.checkGoogleBookExists(id);
            if (checkResult.exists && checkResult.book) {
              setLocalBookId(checkResult.book._id);
              setSavedToLibrary(true);

              // Fetch reviews using the local book ID
              const reviewsData = await reviewsAPI.getReviews({
                bookId: checkResult.book._id,
              });

              console.log("Fetched reviews:", reviewsData); // Debug log
              setReviews(reviewsData.reviews || []);
            } else {
              setReviews([]);
            }
          } catch (checkErr) {
            console.error("Error checking Google Book:", checkErr);
            setReviews([]);
          }
        } else {
          // Local book
          bookData = await booksAPI.getBookById(id);
          setBook(bookData);
          setLocalBookId(id);
          setSavedToLibrary(true);

          // Fetch reviews for local book
          try {
            const reviewsData = await reviewsAPI.getReviews({ bookId: id });
            console.log("Fetched reviews:", reviewsData); // Debug log
            setReviews(reviewsData.reviews || []);
          } catch (reviewErr) {
            console.error("Error fetching reviews:", reviewErr);
            setReviews([]);
          }
        }
      } catch (err) {
        console.error("Error in fetchBookAndReviews:", err);
        setError(err.message || "Failed to load book details");
      } finally {
        setLoading(false);
      }
    };

    if (bookSource) {
      fetchBookAndReviews();
    }
  }, [id, bookSource]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: value,
    });
  };

  const saveGoogleBookToLibrary = async () => {
    if (!user) {
      setError("You must be logged in to save books to your library");
      return false;
    }

    try {
      // Make sure we have the book data
      if (!book) {
        throw new Error("Book data not available");
      }

      // Format the book data for saving
      const bookToSave = {
        title: book.title,
        author: book.author,
        description: book.description,
        genre: book.genre,
        isbn: book.isbn,
        publishedDate: book.publishedDate,
        coverImage: book.coverImage,
        pageCount: book.pageCount,
        publisher: book.publisher,
        language: book.language,
        googleBooksId: book.googleBooksId || id, // Use the ID from the URL if not in book data
      };

      console.log("Saving book to library:", bookToSave); // Debug log

      // Save the book using the API
      const result = await booksAPI.saveGoogleBook(bookToSave, user.token);

      if (result && result._id) {
        setLocalBookId(result._id);
        setSavedToLibrary(true);
        return true;
      } else {
        throw new Error("Failed to get book ID from save response");
      }
    } catch (err) {
      console.error("Error saving book:", err);
      setError(err.message || "Failed to save book to library");
      return false;
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setSubmitError("You must be logged in to submit a review");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Validate form data
      if (!reviewForm.rating || !reviewForm.comment) {
        throw new Error("Please provide both rating and comment");
      }

      // Make sure we have a valid book ID
      const bookIdToUse = localBookId || book._id;
      if (!bookIdToUse) {
        throw new Error("Book ID is missing");
      }

      // Create review data
      const reviewData = {
        bookId: bookIdToUse,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };

      console.log("Submitting review:", reviewData);

      // Submit the review
      const newReview = await reviewsAPI.createReview(reviewData, user.token);

      // Update the reviews list with the new review
      setReviews((prevReviews) => [newReview, ...prevReviews]);

      // Reset form
      setReviewForm({
        rating: 5,
        comment: "",
      });

      setSubmitSuccess(true);
      setSubmitError(null);
    } catch (err) {
      console.error("Review submission error:", err);
      setSubmitError(err.message || "Failed to submit review");
    } finally {
      setSubmitLoading(false);
    }
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    // Create a temporary div element
    const tempDiv = document.createElement("div");
    // Set the HTML content
    tempDiv.innerHTML = html;
    // Return the text content
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  if (loading) {
    return (
      <div className="centered-container">
        <LoadingSpinner size="large" fullPage={false} />
        <p className="loading-text">Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <div className="error-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/books")}
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="error-container">
        <div className="error">Book not found</div>
        <div className="error-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/books")}
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  // Generate a placeholder image if no cover is available
  const coverImage =
    book.coverImage ||
    `https://placehold.co/300x450/e0e0e0/333333?text=${encodeURIComponent(
      book.title
    )}`;

  return (
    <div className="book-details-page">
      <div className="container">
        <div className="book-details">
          <div className="book-details-image">
            <img src={coverImage} alt={book.title} />
            {bookSource === "google" && (
              <div className="source-badge google-badge">Google Books</div>
            )}
            {bookSource === "local" && (
              <div className="source-badge local-badge">Library Book</div>
            )}
          </div>
          <div className="book-details-content">
            <h1 className="book-title">{book.title}</h1>
            <p className="book-author">by {book.author}</p>

            <div className="book-meta">
              {book.genre && <span className="book-genre">{book.genre}</span>}
              {book.publishedDate && (
                <span className="book-date">
                  Published: {new Date(book.publishedDate).toLocaleDateString()}
                </span>
              )}
              {book.isbn && (
                <span className="book-isbn">ISBN: {book.isbn}</span>
              )}
            </div>

            <div className="book-description">
              <h3>Description</h3>
              <p>
                {book.description
                  ? stripHtmlTags(book.description)
                  : "No description available."}
              </p>
            </div>

            {bookSource === "google" && (
              <div className="additional-details">
                <h3>Additional Details</h3>
                <ul className="details-list">
                  {book.publisher && (
                    <li>
                      <strong>Publisher:</strong> {book.publisher}
                    </li>
                  )}
                  {book.pageCount > 0 && (
                    <li>
                      <strong>Pages:</strong> {book.pageCount}
                    </li>
                  )}
                  {book.language && (
                    <li>
                      <strong>Language:</strong> {book.language.toUpperCase()}
                    </li>
                  )}
                </ul>
                <a
                  href={`https://books.google.com/books?id=${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary view-external"
                >
                  View on Google Books
                </a>
              </div>
            )}

            <Link to="/books" className="btn btn-secondary back-btn">
              Back to Books
            </Link>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Reviews</h2>
          <Reviews reviews={reviews} />

          {user && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label htmlFor="rating" className="form-label">
                  Rating:
                </label>
                <div className="rating-input">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <label key={star} className="rating-label">
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        checked={parseInt(reviewForm.rating) === star}
                        onChange={handleReviewChange}
                        className="rating-radio"
                      />
                      <span className="star">{star} ★</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="comment" className="form-label">
                  Your Review:
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  className="form-control"
                  rows="4"
                  required
                  placeholder="Share your thoughts about this book..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <LoadingSpinner size="small" color="light" /> Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
