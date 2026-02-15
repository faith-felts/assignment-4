


/* Create your REST API here with the following endpoints:
    'GET /api/books': 'Get all books',
    'GET /api/books/:id': 'Get a specific book',
    'POST /api/books': 'Add a new book',
    'PUT /api/books/:id': 'Update a book',
    'DELETE /api/books/:id': 'Delete a book'
*/


const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Books for bookstore API
let books = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Fiction",
        copiesAvailable: 5
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Fiction",
        copiesAvailable: 3
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        genre: "Dystopian Fiction",
        copiesAvailable: 7
    }
    // Add more books if you'd like!
];

// Start the server
app.listen(port, () => {
    console.log(`Book API server running at http://localhost:${port}`);
});


// Root endpoint - API homepage
app.get('/', (req, res) => {
    res.json({ 
        message: "Welcome to the Book API", 
        endpoints: { 
            "GET /api/books": "Get all books", 
            "GET /api/books/:id": "Get a specific book by ID" 
        } 
    }); 
});



// GET /books - Return all books
app.get('/api/books', (req, res) => {
      // Sends back the books as JSON as the response to the request
      res.json(books);
});



app.get('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(m => m.id === bookId);
  
	// Return book if it is found
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

// POST /api/books - Add a new book
app.post('/api/books', (req, res) => {
    // Extract data from request body
    const { title, author, genre, copiesAvailable } = req.body;
  
  	// Create new book with generated ID
    const newBook = {
        id: books.length + 1,
        title,
        author,
        genre,
        copiesAvailable
    };
  
    // Add to books array
    books.push(newBook);
  
    // Return the created book with 201 status
    res.status(201).json(newBook);
});

// PUT /api/books/:id - Update an existing book
app.put('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const { title, author, genre, copiesAvailable } = req.body;
  
    // Find the book to update
    const bookIndex = books.findIndex(m => m.id === bookId);
  
    if (bookIndex === -1) {
          return res.status(404).json({ error: 'Book not found' });
    }
  
    // Update the book
    books[bookIndex] = {
        id: bookId,
        title,
        author,
        genre,
        copiesAvailable
    };
  
    // Return the updated book
    res.json(books[bookIndex]);
});

// DELETE /api/books/:id - Delete a book
app.delete('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
  
    // Find the book index
    const bookIndex = books.findIndex(m => m.id === bookId);
  
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }
  
    // Remove the book from array
    const deletedBook = books.splice(bookIndex, 1)[0];
  
    // Return the deleted book
    res.json({ message: 'Book deleted successfully', book: deletedBook });
});