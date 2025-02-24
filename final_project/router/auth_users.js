const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.session.authorization?.username;

  // Check if user is authenticated
  if (!username) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Please log in first" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Add or update review
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review submitted successfully",
    reviews: books[isbn].reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  // Check if the user is authenticated
  if (!username) {
      return res.status(401).json({ message: "Unauthorized: Please log in first" });
  }

  // Check if the book exists
  if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Check if the user has a review for this book
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for this user to delete." });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
      message: "Review deleted successfully",
      reviews: books[isbn].reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
