import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { googleBooksAPI } from "../services/api";
import "./BookList.css";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [booksPerPage] = useState(8);

  useEffect(() => {
    // Fetch all available genres for the filter
    const fetchGenres = async () => {
      try {
        setGenres([
          "Fiction",
          "Non-Fiction",
          "Science Fiction",
          "Fantasy",
          "Mystery",
          "Thriller",
          "Romance",
          "Biography",
          "Computers",
          "Programming",
        ]);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let query = searchTerm || "react";

        if (selectedGenre) {
          query += `+subject:${selectedGenre}`;
        }

        const startIndex = (currentPage - 1) * booksPerPage;

        // Fetch books from Google Books API
        const googleBooksData = await googleBooksAPI.searchBooks(
          query,
          booksPerPage,
          startIndex
        );

        if (!googleBooksData.items) {
          setBooks([]);
          setTotalPages(0);
          setLoading(false);
          return;
        }

        // Format the Google Books data to match our app's format
        const formattedBooks = googleBooksData.items.map((item) =>
          googleBooksAPI.formatBookData(item)
        );

        let sortedBooks = [...formattedBooks];
        if (sortBy === "title") {
          sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "author") {
          sortedBooks.sort((a, b) => a.author.localeCompare(b.author));
        }

        setBooks(sortedBooks);
        setTotalPages(Math.ceil(googleBooksData.totalItems / booksPerPage));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, searchTerm, selectedGenre, sortBy, booksPerPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const renderBooks = () => {
    if (loading) {
      return (
        <div className="centered-container">
          <LoadingSpinner size="large" fullPage={false} />
          <p className="loading-text">Loading books...</p>
        </div>
      );
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (books.length === 0) {
      return (
        <div className="no-results">
          <h3>No books found</h3>
          <p>
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      );
    }

    return (
      <div className="books-grid">
        {books.map((book) => (
          <BookCard key={book._id || book.googleBooksId} book={book} />
        ))}
      </div>
    );
  };

  return (
    <div className="book-list-page">
      <div className="container">
        <h1 className="page-title">Browse Books</h1>
        <div className="filters-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </form>

          <div className="filter-options">
            <div className="filter-group">
              <label htmlFor="genre-filter" className="filter-label">
                Genre:
              </label>
              <select
                id="genre-filter"
                value={selectedGenre}
                onChange={handleGenreChange}
                className="filter-select"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-by" className="filter-label">
                Sort By:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={handleSortChange}
                className="filter-select"
              >
                <option value="newest">Newest</option>
                <option value="title">Title (A-Z)</option>
                <option value="author">Author (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {renderBooks()}

        {!loading && !error && books.length > 0 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo; Previous
            </button>

            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
