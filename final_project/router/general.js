const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");

const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

// Get book list using Promises
public_users.get("/", function (req, res) {
  new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject({ message: "Books not found" });
    }
  })
    .then((bookList) => res.status(200).json(bookList))
    .catch((error) => res.status(404).json(error));
});

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ message: `Book with ISBN ${isbn} not found.` });
    }
  })
    .then((bookDetails) => res.status(200).json(bookDetails))
    .catch((error) => res.status(404).json(error));
});
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author.toLowerCase();

  try {
    // Simulating an async request
    const booksByAuthor = await new Promise((resolve, reject) => {
      let matchingBooks = [];

      for (let bookId in books) {
        if (books[bookId].author.toLowerCase() === author) {
          matchingBooks.push({ id: bookId, title: books[bookId].title });
        }
      }

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject({ message: `No books found by author: ${author}` });
      }
    });

    res.status(200).json({ author, books: booksByAuthor });
  } catch (error) {
    res.status(404).json(error);
  }
});

public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title.toLowerCase();

  try {
    // Simulating an async request
    const bookByTitle = await new Promise((resolve, reject) => {
      let foundBook = null;

      for (let bookId in books) {
        if (books[bookId].title.toLowerCase() === title) {
          foundBook = books[bookId];
          break;
        }
      }

      if (foundBook) {
        resolve(foundBook);
      } else {
        reject({ message: `No book found with title: ${req.params.title}` });
      }
    });

    res.status(200).json(bookByTitle);
  } catch (error) {
    res.status(404).json(error);
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  res.send(JSON.stringify(books[req.params.isbn].reviews, null, 4));
});

module.exports.general = public_users;
