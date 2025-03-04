import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book }) => {
  // Generate a placeholder image if no cover is available
  const coverImage = book.coverImage || 
    `https://placehold.co/300x450/e0e0e0/333333?text=${encodeURIComponent(book.title)}`;
  
  // Determine if this is a Google Books item
  const isGoogleBook = !!book.googleBooksId;
  
  // Create the correct link path with a source identifier
  const detailsPath = isGoogleBook 
    ? `/books/google/${book.googleBooksId || book._id}`
    : `/books/local/${book._id}`;

  return (
    <div className="book-card">
      <Link to={detailsPath} className="book-card-link">
        <div className="book-card-cover">
          {isGoogleBook && (
            <div className="google-books-badge">Google Books</div>
          )}
          <img src={coverImage} alt={book.title} />
        </div>
        <div className="book-card-content">
          <h3 className="book-card-title">{book.title}</h3>
          <p className="book-card-author">by {book.author}</p>
          {book.genre && <span className="book-card-genre">{book.genre}</span>}
        </div>
      </Link>
    </div>
  );
};

export default BookCard; 