var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
var Loan = require('../models').Loan;
var Patron = require('../models').Patron;
// var db = require('../models/index');
var Sequelize = require('sequelize');

// Loan.belongsTo(Book);
Book.hasMany(Loan, {foreignKey: 'book_id', sourceKey: 'id'});
// Loan.belongsTo(Patron, {foreignKey: 'patron_id', sourceKey: 'id'});
// Loan.hasOne(Book);
Patron.hasMany(Loan, {foreignKey: 'patron_id', sourceKey: 'id'});

/* GET all books */
router.get('/', function(req, res) {
  Book.findAll({
    order: [['title', 'DESC']]
  })
    .then(function(books) {
      res.render('all_books', { books: books, pageTitle: 'Book List' });
      console.log('Books are : ' + books);
    })
    .catch(function(error) {
      // res.send(500, error);
      res.status(500).send(error);
    });
});

/* router.get('/:id', function(req, res) {
  Book.findById(req.params.id)
  .then(function(book) {
    Loan.findAll({
      include: [
        { model: Patron }
      ],
      where: { book_id : book.id}
    }).then(function(loans) {
        if(loans){
          res.render('book_detail', {
          book: book,
          loans: loans,
          pageTitle: 'Book: '
        });
        console.log('Books is : ' + book.title);
        } else {
          res.sendStatus(404);
        }
      })
      .catch(function(error) {
        console.log(error);
        res.status(500).send(error);
      });
  });
}); */

router.get('/:id', function(req, res) {
  Book.findById(req.params.id, {
    include: [
      {
        model : Loan,
      }
    ]
  }).then(function (book) {
    var bookObj = Object.assign(
        {},
        {
          bookTitle : book.title,
          bookAuthor : book.author,
          bookGenre : book.genre,
          bookFirstPublished : book.first_published,
          bookLoans : book.Loans.map(function (loan) {
            var patronName = '';
            Patron.findById(loan.patron_id).then(function (patron) {
              console.log(patron.first_name + ' ' + patron.last_name);
              patronName = patron.first_name + ' ' + patron.last_name;
            });

            return Object.assign(
              {},
              {
                loanId : loan.id,
                loanBook : loan.book_id,
                loanOn : loan.loaned_on,
                loanReturnBy : loan.return_by,
                loanReturnOn : loan.returned_on,
                loanPatronId : loan.patron_id,
                loanPatron : patronName
              }
            );
          })
        }
      )
      res.render('book_detail', { book: bookObj, pageTitle: 'Book List' });
      console.log(bookObj);
  }).catch(function(error) {
    console.log(error);
    res.status(500).send(error);
  });
  
});
module.exports = router;
