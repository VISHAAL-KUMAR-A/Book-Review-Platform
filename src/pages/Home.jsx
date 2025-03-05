import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookCard from "../components/BookCard";
import { booksAPI } from "../services/api";
import bookIllustration from "../assets/images/book-illustration.jpg";
import "./Home.css";

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const data = await booksAPI.getBooks({ limit: 4 });
        setFeaturedBooks(data.books);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Discover Your Next Favorite Book</h1>
            <p className="hero-description">
              Explore our vast collection of books, read reviews, and join a
              community of book lovers.
            </p>
            <div className="hero-buttons">
              <Link to="/books" className="btn btn-primary hero-btn">
                Browse Books
              </Link>
              <Link to="/register" className="btn btn-secondary hero-btn">
                Join Now
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src={bookIllustration} alt="Books illustration" />
          </div>
        </div>
      </section>
      <section className="featured-books">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Books</h2>
            <Link to="/books" className="section-link">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading featured books...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="grid grid-cols-4">
              {featuredBooks?.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="grid grid-cols-3 steps-container">
            <div className="step">
              <div className="step-icon">1</div>
              <h3 className="step-title">Discover</h3>
              <p className="step-description">
                Browse our extensive collection of books across various genres.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">2</div>
              <h3 className="step-title">Read Reviews</h3>
              <p className="step-description">
                See what others think about books you're interested in.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">3</div>
              <h3 className="step-title">Share Your Thoughts</h3>
              <p className="step-description">
                Write reviews and help others find their next great read.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
