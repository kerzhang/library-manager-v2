var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

/* GET all books */
router.get('/', function(req, res) {
  var today = new Date().toISOString().substring(0, 10);

  if (req.query.filter === 'overdue') {
    db.Book
      .findAll({
        include: {
          model: db.Loan,
          where: {
            return_by: { $lt: today }
          }
        }
      })
      .then(function(books) {
        console.log(books);
        res.render('overdue_books', {
          books: books,
          pageTitle: 'Overdue Books'
        });
      })
      .catch(function(error) {
        console.log(error);
        res.status(500).send(error);
      });
    // } else {
    //   res.sendStatus(404);
  } else if (req.query.filter === 'checked_out') {
    db.Book
      .findAll({
        include: {
          model: db.Loan,
          where: {
            returned_on: null
          }
        }
      })
      .then(function(books) {
        console.log(books);
        res.render('checked_books', {
          books: books,
          pageTitle: 'Books Not Returned'
        });
      })
      .catch(function(error) {
        res.status(500).send(error);
      });
  } else {
    db.Book
      .findAll({
        order: [['title', 'DESC']]
      })
      .then(function(books) {
        res.render('all_books', { books: books, pageTitle: 'Book List' });
      })
      .catch(function(error) {
        console.log("Error: " + error);
        res.status(500).send(error);
      });
  }
});

//Save new book
router.post('/', function(req, res, next) {
  console.log(req.body);
  db.Book.create(req.body).then(function() {
    res.redirect('/books');
  }).catch(function(error) {
    console.log("Error: " + error);
    res.status(500).send(error);
  });
});


//Add new book
router.get('/new', function(req, res, next) {
  res.render('new_book', { book: db.Book.build(), pageTitle: 'New Book' });
});


//Return book
router.get('/return_book/:id', function(req, res, next) {
  console.log('got the book' + id);
  db.Book
    .findById(req.params.id)
    .then(function(book) {
      res.render('return_book', { book: book, pageTitle: 'Return Book' });
    })
    .catch(function(error) {
      console.log('there is error: ' + error);
      res.status(500).send(error);
    });
});

//Update book information
router.post('/:id', function(req, res, next) {
  db.Book
    .findById(req.params.id)
    .then(function(book) {
      console.log('Book --------------->' + book.id);
      if (book) {
        console.log(req.body);
        return book.update(req.body);
      } else {
        res.send(404);
      }
    })
    .then(function(book) {
      res.redirect('/books');
    })
    .catch(function(error) {
      // TODO: DATA VALIDATION AND ERROR HANDLE
      console.log(error);
      res.status(500).send(error);
    });
});


router.get('/:id', function(req, res) {
  db.Book.findById(req.params.id).then(function(book) {
    db.Loan
      .findAll({
        include: [
          // {
          //   model: db.Book
          // },
          {
            model: db.Patron
          }
        ],
        where: {
          book_id: book.id
        }
      })
      .then(function(loans) {
        if (loans) {
          console.log(loans);
          res.render('book_detail', {
            book: book,
            loans: loans,
            pageTitle: 'Book Detail'
          });
        } else {
          res.sendStatus(404);
        }
      })
      .catch(function(error) {
        console.log(error);
        res.sendStatus(500);
      });
  });
});

module.exports = router;
