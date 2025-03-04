import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { booksAPI, reviewsAPI, googleBooksAPI } from '../services/api';
import './BookDetails.css';

const BookDetails = ({ user, source }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
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
      if (path.includes('/books/google/')) {
        setBookSource('google');
      } else if (path.includes('/books/local/')) {
        setBookSource('local');
      } else {
        // Legacy URL - we'll need to guess based on ID format or redirect
        // For now, let's assume MongoDB IDs are 24 characters
        setBookSource(id.length === 24 ? 'local' : 'google');
      }
    }
  }, [id, bookSource, source]);

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      if (!bookSource) return; // Wait until we know the source
      
      setLoading(true);
      setError(null);
      
      try {
        let bookData;
        
        if (bookSource === 'google') {
          try {
            console.log('Fetching from Google Books API:', id);
            const googleBookData = await googleBooksAPI.getBookById(id);
            bookData = googleBooksAPI.formatBookData(googleBookData);
            setBook(bookData);
            
            // Check if this Google Book exists in our database
            try {
              const checkResult = await booksAPI.checkGoogleBookExists(id);
              if (checkResult.exists && checkResult.book) {
                setLocalBookId(checkResult.book._id);
                setSavedToLibrary(true);
                
                // Fetch reviews for this book using the local ID
                const reviewsData = await reviewsAPI.getReviews({ bookId: checkResult.book._id });
                setReviews(reviewsData.reviews || []);
              } else {
                // No reviews yet
                setReviews([]);
              }
            } catch (checkErr) {
              console.error('Error checking if Google Book exists:', checkErr);
              // Continue without reviews
              setReviews([]);
            }
          } catch (googleErr) {
            console.error('Error fetching from Google Books API:', googleErr);
            throw new Error('Failed to load book details from Google Books. Please try again later.');
          }
        } else {
          try {
            console.log('Fetching from local API:', id);
            bookData = await booksAPI.getBookById(id);
            setBook(bookData);
            setLocalBookId(id);
            setSavedToLibrary(true);
            
            // Fetch reviews for this book using the API service
            const reviewsData = await reviewsAPI.getReviews({ bookId: id });
            setReviews(reviewsData.reviews || []);
          } catch (localErr) {
            console.error('Error fetching from local API:', localErr);
            throw new Error('Failed to load book details from our database. Please try again later.');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchBookAndReviews:', err);
        setError(err.message || 'An unexpected error occurred. Please try again later.');
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
      [name]: value
    });
  };

  const saveGoogleBookToLibrary = async () => {
    if (!user || !user.token) {
      setSubmitError('You must be logged in to save this book to your library');
      return;
    }

    setSavingToLibrary(true);
    setSubmitError(null);

    try {
      // Save the Google Book to our database
      const savedBook = await booksAPI.saveGoogleBook({
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
        googleBooksId: book.googleBooksId
      }, user.token);
      
      // Update the local book ID
      setLocalBookId(savedBook._id);
      setSavedToLibrary(true);
      setSavingToLibrary(false);
    } catch (err) {
      console.error('Error saving Google Book to library:', err);
      setSubmitError(err.message || 'Failed to save book to library. Please try again later.');
      setSavingToLibrary(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setSubmitError('You must be logged in to submit a review');
      return;
    }

    // For Google Books, we need to save the book to our library first
    if (bookSource === 'google' && !savedToLibrary) {
      await saveGoogleBookToLibrary();
      if (!savedToLibrary) {
        return; // If saving failed, don't continue
      }
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      if (!user.token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }
      
      // Use the local book ID for the review
      const bookIdForReview = localBookId || id;
      
      // Submit review using the API service
      const newReview = await reviewsAPI.createReview({
        bookId: bookIdForReview,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment
      }, user.token);
      
      // Add the new review to the reviews list
      setReviews([newReview, ...reviews]);
      
      // Reset the form
      setReviewForm({
        rating: 5,
        comment: ''
      });
      
      setSubmitSuccess(true);
      setSubmitLoading(false);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitLoading(false);
    }
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    // Create a temporary div element
    const tempDiv = document.createElement('div');
    // Set the HTML content
    tempDiv.innerHTML = html;
    // Return the text content
    return tempDiv.textContent || tempDiv.innerText || '';
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
            onClick={() => navigate('/books')}
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
            onClick={() => navigate('/books')}
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  // Generate a placeholder image if no cover is available
  const coverImage = book.coverImage || 
    `https://placehold.co/300x450/e0e0e0/333333?text=${encodeURIComponent(book.title)}`;

  return (
    <div className="book-details-page">
      <div className="container">
        <div className="book-details">
          <div className="book-details-image">
            <img src={coverImage} alt={book.title} />
            {bookSource === 'google' && (
              <div className="source-badge google-badge">Google Books</div>
            )}
            {bookSource === 'local' && (
              <div className="source-badge local-badge">Library Book</div>
            )}
          </div>
          <div className="book-details-content">
            <h1 className="book-title">{book.title}</h1>
            <p className="book-author">by {book.author}</p>
            
            <div className="book-meta">
              {book.genre && (
                <span className="book-genre">{book.genre}</span>
              )}
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
              <p>{book.description ? stripHtmlTags(book.description) : "No description available."}</p>
            </div>
            
            {bookSource === 'google' && (
              <div className="additional-details">
                <h3>Additional Details</h3>
                <ul className="details-list">
                  {book.publisher && <li><strong>Publisher:</strong> {book.publisher}</li>}
                  {book.pageCount > 0 && <li><strong>Pages:</strong> {book.pageCount}</li>}
                  {book.language && <li><strong>Language:</strong> {book.language.toUpperCase()}</li>}
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

        {/* Reviews section - now available for both local and Google books */}
        <div className="book-reviews-section">
          <h2 className="section-title">Reviews</h2>
          
          {/* For Google Books, show save to library button if not already saved */}
          {bookSource === 'google' && !savedToLibrary && (
            <div className="save-to-library">
              <p>To write a review, you need to save this book to your library first.</p>
              {submitError && (
                <div className="error-message">{submitError}</div>
              )}
              <button 
                className="btn btn-primary save-btn"
                onClick={saveGoogleBookToLibrary}
                disabled={savingToLibrary || !user}
              >
                {savingToLibrary ? (
                  <>
                    <LoadingSpinner size="small" color="light" /> Saving...
                  </>
                ) : (
                  'Save to Library'
                )}
              </button>
              {!user && (
                <div className="login-prompt">
                  <p>Please <Link to="/login">log in</Link> to save books and write reviews.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Show review form if user is logged in and (for Google Books) the book is saved to library */}
          {user && (bookSource === 'local' || savedToLibrary) ? (
            <div className="review-form-container">
              <h3>Write a Review</h3>
              {submitSuccess && (
                <div className="success-message">
                  Your review has been submitted successfully!
                </div>
              )}
              {submitError && (
                <div className="error-message">{submitError}</div>
              )}
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="form-group">
                  <label htmlFor="rating" className="form-label">Rating:</label>
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
                  <label htmlFor="comment" className="form-label">Your Review:</label>
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
                    'Submit Review'
                  )}
                </button>
              </form>
            </div>
          ) : !savedToLibrary ? null : (
            <div className="login-prompt">
              <p>Please <Link to="/login">log in</Link> to write a review.</p>
            </div>
          )}
          
          <div className="reviews-list">
            <h3>{reviews.length} Reviews</h3>
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review this book!</p>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails; 