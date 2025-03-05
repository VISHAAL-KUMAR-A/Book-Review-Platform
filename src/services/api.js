// API base URL
// Change this to match your backend server URL and port
const API_BASE_URL = "http://localhost:3000/api";

// Add this import at the top of the file
import axios from "axios";

/**
 * Handles API responses and error parsing
 * @param {Response} response - The fetch response object
 * @returns {Promise<any>} - Parsed response data
 * @throws {Error} - Error with message from API or default message
 */
async function handleResponse(response) {
  if (!(response.status >= 200 && response.status < 300)) {
    let errorMessage = `Request failed with status: ${response.status}`;

    // Try to get more detailed error information
    try {
      // First try to parse as JSON
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If JSON parsing fails, try to get text content
      try {
        const textContent = await response.text();
        console.error("API Response (not JSON):", textContent);

        // Check if it's an HTML response (likely a server error page)
        if (
          textContent.includes("<!DOCTYPE html>") ||
          textContent.includes("<html>")
        ) {
          errorMessage = `Server error (${response.status}). The API server might be down or unreachable.`;
        }
      } catch {
        // If even text extraction fails, use the default error message
      }
    }

    throw new Error(errorMessage);
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    return response;
  }
}

/**
 * API service for authentication
 */
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - User data with token
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} - User data with token
   */
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
};

/**
 * API service for books
 */
export const booksAPI = {
  /**
   * Get all books with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Books data with pagination
   */
  getBooks: async (params = {}) => {
    try {
      // Build query string from params
      const queryString = Object.keys(params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&");

      const url = `${API_BASE_URL}/books${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error("Get books error:", error);
      throw error;
    }
  },

  /**
   * Get a single book by ID
   * @param {string} id - Book ID
   * @returns {Promise<Object>} - Book data
   */
  getBookById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Get book ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Check if a Google Book is already in our database
   * @param {string} googleBooksId - Google Books ID
   * @returns {Promise<Object>} - Response with exists flag and bookId if found
   */
  checkGoogleBook: async (googleBooksId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/books/google/${googleBooksId}`
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { exists: false };
      }
      throw new Error(
        error.response?.data?.message || "Error checking Google book"
      );
    }
  },

  /**
   * Save a Google Book to our database
   * @param {Object} bookData - Book data to save
   * @param {string} token - User authentication token
   * @returns {Promise<Object>} - Saved book data
   */
  saveGoogleBook: async (bookData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save Google book");
      }

      return data;
    } catch (error) {
      console.error("Save Google book error:", error);
      throw error;
    }
  },

  /**
   * Check if a Google Book exists in our database
   * @param {string} googleBooksId - The Google Books ID to check
   * @returns {Promise<Object>} - The book data if it exists, or null
   */
  checkGoogleBookExists: async (googleBooksId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/books/google/${googleBooksId}`
      );
      const data = await response.json();

      if (!response.ok && response.status !== 404) {
        throw new Error(data.message || "Error checking Google book");
      }

      return response.status === 200 ? data : { exists: false };
    } catch (error) {
      console.error("Check Google book error:", error);
      throw error;
    }
  },
};

/**
 * API service for reviews
 */
export const reviewsAPI = {
  /**
   * Get reviews with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Reviews data
   */
  getReviews: async (params = {}) => {
    try {
      const queryString = Object.keys(params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&");

      const response = await fetch(
        `${API_BASE_URL}/reviews${queryString ? `?${queryString}` : ""}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch reviews");
      }

      return data;
    } catch (error) {
      console.error("Get reviews error:", error);
      throw error;
    }
  },

  /**
   * Create a new review
   * @param {Object} reviewData - Review data
   * @param {string} token - User authentication token
   * @returns {Promise<Object>} - Created review data
   */
  createReview: async (reviewData, token) => {
    try {
      if (!token) {
        throw new Error("Authentication token is required");
      }

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create review");
      }

      return data;
    } catch (error) {
      console.error("Create review error:", error);
      throw error;
    }
  },
};

/**
 * API service for user profiles
 */
export const usersAPI = {
  /**
   * Get user profile by ID
   * @param {string} id - User ID
   * @param {string} token - User authentication token
   * @returns {Promise<Object>} - User profile data
   */
  getUserProfile: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Get user ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {string} id - User ID
   * @param {Object} userData - User profile data to update
   * @param {string} token - User authentication token
   * @returns {Promise<Object>} - Updated user profile data
   */
  updateUserProfile: async (id, userData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Update user ${id} error:`, error);
      throw error;
    }
  },
};

/**
 * API service for Google Books
 */
export const googleBooksAPI = {
  /**
   * Search for books using the Google Books API
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results to return (default: 20)
   * @param {number} startIndex - Starting index for pagination (default: 0)
   * @returns {Promise<Object>} - Books data from Google API
   */
  searchBooks: async (query, maxResults = 20, startIndex = 0) => {
    try {
      console.log("Searching Google Books API for:", query);
      // Using the API without a key for basic searches
      const response = await axios.get(
        "https://www.googleapis.com/books/v1/volumes",
        {
          params: {
            q: query,
            maxResults,
            startIndex,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Google Books API search error:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw new Error(
        "Failed to fetch books from Google Books API. Please try again later."
      );
    }
  },

  /**
   * Get book details by Google Books volume ID
   * @param {string} volumeId - Google Books volume ID
   * @returns {Promise<Object>} - Book details
   */
  getBookById: async (volumeId) => {
    try {
      console.log("Fetching Google Book details for ID:", volumeId);
      // Using the API without a key for basic fetches
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${volumeId}`
      );

      return response.data;
    } catch (error) {
      console.error(
        `Google Books API getBookById error for ${volumeId}:`,
        error
      );
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw new Error(
        `Failed to fetch book details from Google Books API. Please try again later.`
      );
    }
  },

  /**
   * Convert Google Books API data to our app's book format
   * @param {Object} googleBook - Book data from Google Books API
   * @returns {Object} - Formatted book data for our app
   */
  formatBookData: (googleBook) => {
    if (!googleBook || !googleBook.volumeInfo) {
      console.error("Invalid Google Book data:", googleBook);
      return {
        _id: googleBook?.id || "unknown",
        title: "Unknown Title",
        author: "Unknown Author",
        description: "No description available",
        genre: "Uncategorized",
        isbn: "Unknown",
        publishedDate: null,
        coverImage: null,
        pageCount: 0,
        publisher: "Unknown Publisher",
        language: "en",
        googleBooksId: googleBook?.id || "unknown",
      };
    }

    const volumeInfo = googleBook.volumeInfo;

    return {
      _id: googleBook.id,
      title: volumeInfo.title || "Unknown Title",
      author: volumeInfo.authors
        ? volumeInfo.authors.join(", ")
        : "Unknown Author",
      description: volumeInfo.description || "No description available",
      genre: volumeInfo.categories ? volumeInfo.categories[0] : "Uncategorized",
      isbn: volumeInfo.industryIdentifiers
        ? volumeInfo.industryIdentifiers[0].identifier
        : "Unknown",
      publishedDate: volumeInfo.publishedDate || null,
      coverImage: volumeInfo.imageLinks
        ? volumeInfo.imageLinks.thumbnail
        : null,
      pageCount: volumeInfo.pageCount || 0,
      publisher: volumeInfo.publisher || "Unknown Publisher",
      language: volumeInfo.language || "en",
      googleBooksId: googleBook.id,
    };
  },
};
