const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "No description available",
    },
    genre: {
      type: String,
      default: "Uncategorized",
    },
    isbn: {
      type: String,
      default: "Unknown",
    },
    publishedDate: {
      type: Date,
    },
    coverImage: {
      type: String,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    publisher: {
      type: String,
    },
    language: {
      type: String,
      default: "en",
    },
    googleBooksId: {
      type: String,
      sparse: true,
      unique: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
