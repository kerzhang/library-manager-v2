var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

var PAGE_LIMIT = 8;
var paginations = [];

function countTotalPagesAndBooks(allBooks) {
  paginations = [];
  var booksCount = allBooks.length;
  var pages = Math.ceil(booksCount / PAGE_LIMIT);
  for (var index = 1; index <= pages; index++) {
    paginations.push(index);  
  }
  console.log('Total ' + booksCount + ' books in ' + paginations + ' pages.');
  console.log(paginations);
}

router.get('/checked_out', function (req, res) {
  var today = new Date().toISOString().substring(0, 10);
  
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
    // console.log(books);
    res.render('checked_books', {
      books: books,
      pageTitle: 'Books Not Returned'
    });
  })
  .catch(function(error) {
    res.status(500).send(error);
  });
});

router.get('/overdue', function (req, res) {
  var today = new Date().toISOString().substring(0, 10);
  
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
    // console.log(books);
    res.render('overdue_books', {
      books: books,
      pageTitle: 'Overdue Books'
    });
  })
  .catch(function(error) {
    console.log(error);
    res.status(500).send(error);
  });
});

/* GET all books */
router.get('/', function(req, res) {
  db.Book
    .findAll()
    .then(function(books) {
      countTotalPagesAndBooks(books);
    })
    .then(function() {
      if (req.query.search !== undefined) {
        db.Book
        .findAll({
          order: [['title', 'DESC']],
          where: {
            $or: [
              {
                title: { $like: '%' + req.query.search + '%' }
              },
              {
                author: { $like: '%' + req.query.search + '%' }
              },
              {
                genre: { $like: '%' + req.query.search + '%' }
              }
            ]
          }
        })
        .then(function(books) {
          countTotalPagesAndBooks(books);
          res.render('all_books', { 
            books: books, 
            pageTitle: 'Book List',
            currentPage: 1,
            totalPages: []            
          });
        })
        .catch(function (error) {
           // console.log(error);
           res.status(500).send(error);
        })
      } else if (req.query.page !== undefined) {
        let clickedPage = 1;
        if (req.query.page <= paginations.length && req.query.page > 0) {

          //Get the requested page number and then perform the query
          clickedPage = req.query.page;
        db.Book
          .findAll({
            order: [['title', 'DESC']],
            limit: PAGE_LIMIT,
            offset: PAGE_LIMIT * (parseInt(req.query.page)-1),
          })
          .then(function(books) {
            res.render('all_books', { 
              books: books, 
              pageTitle: 'Book List',
              currentPage: clickedPage,
              totalPages: paginations            
            });
          })
          .catch(function(error) {
            console.log('Error: ' + error);
            res.status(500).send(error);
          })
        } else {
          var err = new Error('That page doesn\'t exist!');
          err.status = 404;
          res.render('error', {
            errors: [err],
            path: '/books/'
          })
        }
      } else {
        db.Book
          .findAll({
            order: [['title', 'DESC']],
            limit: PAGE_LIMIT,
            offset: 0,
          })
          .then(function(books) {
            res.render('all_books', { 
              books: books, 
              pageTitle: 'Book List',
              currentPage: 1,
              totalPages: paginations
             });
          })
          .catch(function(error) {
            console.log('Book Error: ' + error);
            res.status(500).send(error);
          });
      }
    });
});

//Save new book
router.post('/', function(req, res, next) {
  db.Book
    .create(req.body)
    .then(function() {
      res.redirect('/books');
    })
    .catch(function(err) {
      if (err.name === 'SequelizeValidationError') {
        res.render('new_book', {
          book: db.Book.build(req.body),
          errors: err.errors
        });
      } else {
        throw err;
      }
    })
    .catch(function(err) {
      console.log('Error: ' + err);
      res.status(500).send(err);
    });
});

//Add new book
router.get('/new', function(req, res, next) {
  res.render('new_book', { book: db.Book.build(), pageTitle: 'New Book' });
});

//Update book information
router.route('/:id')
.get(function(req, res) {
  db.Book.findById(req.params.id).then(function(book) {
    if (book) {
      db.Loan
      .findAll({
        include: [
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
          // console.log(loans);
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
    } else {
      var err = new Error('That book doesn\'t exist!');
      err.status = 404;
      res.render('error', {
        errors: [err],
        path: '/books/'
      })
    }

  });
})
.post(function(req, res, next) {
  db.Book
    .findById(req.params.id)
    .then(function(book) {
      if (book) {
        // console.log(req.body);
        return book.update(req.body);
      } else {
      //TODO: create new Error object
      res.send(404);
      }
    })
    .then(function(book) {
      res.redirect('/books');
    })
    .catch(function(err) {
      if (err.name === 'SequelizeValidationError') {
        res.render('error', {
          errors: err.errors,
          path: '/books/'
        });
      } else {
        throw err;
      }
    })
    .catch(function(err) {
      console.log('Error: ' + err);
      res.status(500).send(err);
    });
});

module.exports = router;
