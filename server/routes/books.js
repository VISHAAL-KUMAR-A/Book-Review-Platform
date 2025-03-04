const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const { createBookValidation, getBookValidation, getBooksValidation } = require('../validations/bookValidations');

// GET /books - Retrieve all books (with pagination)
router.get('/', validate(getBooksValidation), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments();

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /books/:id - Retrieve a specific book
router.get('/:id', validate(getBookValidation), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /books - Add a new book (admin only)
router.post('/', [auth, admin, validate(createBookValidation)], async (req, res) => {
  try {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      isbn: req.body.isbn,
      publishedDate: req.body.publishedDate,
      genre: req.body.genre
    });

    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A book with this ISBN already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Check if a Google Book exists in our database
router.get('/google/:googleBooksId', async (req, res) => {
  try {
    const { googleBooksId } = req.params;
    
    const book = await Book.findOne({ googleBooksId });
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Google Book not found in our database',
        exists: false
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Google Book found in our database',
      exists: true,
      book
    });
  } catch (error) {
    console.error('Error checking Google Book:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while checking Google Book'
    });
  }
});

// Save a Google Book to our database
router.post('/google', auth, async (req, res) => {
  try {
    const { 
      title, author, description, genre, isbn, 
      publishedDate, coverImage, pageCount, 
      publisher, language, googleBooksId 
    } = req.body;
    
    // Check if this Google Book already exists
    let book = await Book.findOne({ googleBooksId });
    
    if (book) {
      return res.json({ 
        success: true, 
        message: 'Google Book already exists in our database',
        _id: book._id
      });
    }
    
    // Create a new book
    book = new Book({
      title,
      author,
      description,
      genre,
      isbn,
      publishedDate,
      coverImage,
      pageCount,
      publisher,
      language,
      googleBooksId
    });
    
    await book.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Google Book saved to our database',
      _id: book._id
    });
  } catch (error) {
    console.error('Error saving Google Book:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while saving Google Book'
    });
  }
});

module.exports = router; 