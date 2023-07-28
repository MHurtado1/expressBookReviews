const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
  }

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.body.username;
  
    // Check if the book exists in the database
    if (books.hasOwnProperty(isbn)) {
      const book = books[isbn];
  
      // Check if the user already has a review for the book
      if (book.reviews.hasOwnProperty(username)) {
        // Modify the existing review
        book.reviews[username].review = review;
        //console.log(book.reviews[username])
        console.log("books["+ isbn +"].reviews:" + Object.entries(books[isbn].reviews))
        return res.status(200).json({ message: "Review modified successfully" });
      } else {
        // Add a new review for the user
        book.reviews[username] = {
          username: username,
          review: review,
        };
        //console.log(book.reviews[username])
        console.log("books["+ isbn +"].reviews:" + Object.entries(books[isbn].reviews))
        return res.status(200).json({ message: "Review added successfully" });
      }
    } else {
        //console.log(book.reviews[username])
        console.log("books["+ isbn +"].reviews:" + Object.entries(books[isbn].reviews))
      return res.status(404).json({ message: "Book not found" });
    }
  });

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.body.username;

    // Check if the book exists in the database
    if (books.hasOwnProperty(isbn)) {
        const book = books[isbn];
    
        // Check if the user already has a review for the book
        if (book.reviews.hasOwnProperty(username)) {
          delete book.reviews[username];
          console.log("books["+ isbn +"].reviews:" + Object.entries(books[isbn].reviews))
          return res.status(200).json({ message: "Review deleted successfully" });
        } else {
          console.log("books["+ isbn +"].reviews:" + Object.entries(books[isbn].reviews))
          return res.status(200).json({ message: "There is no review from the user " + username});
        }
      }
    return res.status(200).json({ message: "There is no book with the isbn " + isbn});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
