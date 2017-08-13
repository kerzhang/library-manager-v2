var express = require('express');
var router = express.Router();
// var Book = require('../models').Book;
// var Loan = require('../models').Loan;
// var Patron = require('../models').Patron;
var db = require('../config/db.js');

// Loan.belongsTo(Book, { foreignKey: 'book_id', sourceKey: 'id' });
// Book.hasMany(Loan, { foreignKey: 'book_id', sourceKey: 'id' });
// Loan.belongsTo(Patron, {foreignKey: 'patron_id', sourceKey: 'id'});
// Patron.hasMany(Loan, { foreignKey: 'patron_id', sourceKey: 'id' });

/* GET all books */
router.get('/', function(req, res) {
  db.Book.findAll({
    order: [['title', 'DESC']]
  })
    .then(function(books) {
      res.render('all_books', { books: books, pageTitle: 'Book List' });
      // console.log('Books are : ' + books);
    })
    .catch(function(error) {
      res.status(500).send(error);
    });
});

//Save new book
router.post('/', function(req, res, next) {
  console.log(req.body);
  db.Book.create(req.body).then(function(book) {
    res.redirect('/books');
  });
});

//Add new book
router.get('/new', function(req, res, next) {
  res.render('new_book', { book: db.Book.build(), pageTitle: 'New Book' });
});

//Update book information
router.post('/:id', function(req, res, next) {
  db.Book.findById(req.params.id)
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
      res.redirect('/books/' + book.id);
    })
    .catch(function(error) {
      // TODO: DATA VALIDATION AND ERROR HANDLE
      console.log(error);
      res.status(500).send(error);
    });
});

//Get book details for book detail page.
/* router.get('/:id', function(req, res) {
  Book.findById(req.params.id, {
    include: [
      {
        model: Loan
      }
    ]
  })
    .then(function(book) {
      var bookObj = Object.assign(
        {},
        {
          id: book.id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          first_published: book.first_published,
          bookLoans: book.Loans.map(function(loan) {
            //FIXME: Find a way to fetch the patron name.
            var patronName = '';
            Patron.findById(loan.patron_id).then(function(patron) {
              console.log(patron.first_name + ' ' + patron.last_name);
              patronName = patron.first_name + ' ' + patron.last_name;
            });

            return Object.assign(
              {},
              {
                loanId: loan.id,
                loanBook: loan.book_id,
                loanOn: loan.loaned_on,
                loanReturnBy: loan.return_by,
                loanReturnOn: loan.returned_on,
                loanPatronId: loan.patron_id,
                loanPatron: patronName
              }
            );
          })
        }
      );
      res.render('book_detail', { book: bookObj, pageTitle: 'Book Detail' });
      console.log(bookObj);
    })
    .catch(function(error) {
      console.log(error);
      res.status(500).send(error);
    });
}); */

router.get('/:id', function(req, res) {
  db.Book.findById(req.params.id).then(function(book) {
    db.Loan.findAll({
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
