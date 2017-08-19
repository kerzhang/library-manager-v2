var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

var PAGE_LIMIT = 8;
var paginations = [];

function countTotalPagesAndLoans(allLoans) {
  paginations = [];
  var loansCount = allLoans.length;
  var pages = Math.ceil(loansCount / PAGE_LIMIT);
  for (var index = 1; index <= pages; index++) {
    paginations.push(index);
  }
  console.log(paginations);
}

router.get('/overdue', function (req, res) {
  var today = new Date().toISOString().substring(0, 10);
    db.Loan
      .findAll({
        include: [
          {
            model: db.Book
          },
          {
            model: db.Patron
          }
        ],
        where: {
          return_by: {
            $lt: today
          },
          returned_on: null
        }
      })
      .then(function(loans) {
        res.render('overdue_loans', {
          loans: loans,
          pageTitle: 'Overdue Loans'
        });
      })
      .catch(function(error) {
        console.log(error);
        res.status(500).send(error);
      });
});


router.get('/checked_out', function (req, res) {
  var today = new Date().toISOString().substring(0, 10);
  db.Loan
  .findAll({
    include: [
      {
        model: db.Book
      },
      {
        model: db.Patron
      }
    ],
    where: {
      returned_on: null
    }
  })
  .then(function(loans) {
    res.render('checked_loans', {
      loans: loans,
      pageTitle: 'Loans Checked Out'
    });
  })
  .catch(function(error) {
    res.status(500).send(error);
  });
});

/* GET all loans record */
router.get('/', function(req, res) {
  var today = new Date().toISOString().substring(0, 10);

  db.Loan
    .findAll()
    .then(function(loans) {
      countTotalPagesAndLoans(loans);
    })
    .then(function() {
      if (req.query.page !== undefined) {
        var clickedPage = 1;
        if (req.query.page <= paginations.length && req.query.page > 0) {
          console.log('current page is: ' + req.query.page);
          clickedPage = req.query.page;
          db.Loan
            .findAll({
              include: [
                {
                  model: db.Book
                },
                {
                  model: db.Patron
                }
              ],
              limit: PAGE_LIMIT,
              offset: PAGE_LIMIT * (parseInt(req.query.page) - 1)
            })
            .then(function(loans) {
              res.render('all_loans', {
                loans: loans,
                pageTitle: 'Loan Records',
                currentPage: clickedPage,
                totalPages: paginations
              });
              // console.log(loans);
            })
            .catch(function(error) {
              // console.log(error);
              res.status(500).send(error);
            });
        } else {
          var err = new Error('That page doesn\'t exist!');
          err.status = 404;
          res.render('error', {
            errors: [err],
            path: '/loans/'
          })
        }
      } else {
        db.Loan
          .findAll({
            include: [
              {
                model: db.Book
              },
              {
                model: db.Patron
              }
            ],
            limit: PAGE_LIMIT,
            offset: 0,
          })
          .then(function(loans) {
            res.render('all_loans', {
              loans: loans,
              pageTitle: 'Loan Records',
              currentPage: 1,
              totalPages: paginations
            });
            // console.log(loans);
          })
          .catch(function(error) {
            console.log('Loan Error: ' + error);
            res.status(500).send(error);
          });
      }
    });
});

//Add new loan
router.get('/new', function(req, res, next) {
  var allBooks = [];
  var allPatrons = [];
  var booksNotReturned = [];
  var availableBooks =[];

  db.Patron.findAll().then(function(patrons) {
    allPatrons = patrons;
    
    //Find all available books, all loaned books should be filtered
    db.Book
      .findAll({
      })
      .then(function(books) {
        allBooks = books;
        db.Loan.findAll({
          attribute: ['book_id'],
          where: {
            returned_on: null
          }
        }).then(function(loans){
          loans.forEach(function(loan){
            booksNotReturned.push(loan.book_id)
          });
          // console.log('== Books not returned: ' + booksNotReturned);
          books.forEach(function(book) {
            if (booksNotReturned.indexOf(book.id) < 0) {
              availableBooks.push(book);
            }
          }, this);
          console.log('== Books available: ' + availableBooks);          
        })
        .then(function() {
          var loanDate = new Date().toISOString().substring(0, 10);
          var today = new Date();
          var returnDate = new Date(
            today.setDate(today.getDate() + 7)
          ).toISOString().substring(0, 10);
          res.render('new_loan', {
            loan: db.Loan.build(),
            books: availableBooks,
            patrons: allPatrons,
            loanDate: loanDate,
            returnDate: returnDate,
            pageTitle: 'New Loan'
          });
        });
      });
  });
});

//Save new loan
router.post('/', function(req, res, next) {
  // console.log(req.body);
  db.Loan
    .create(req.body)
    .then(function() {
      res.redirect('/loans');
    })
    .catch(function(err) {
      if (err.name === 'SequelizeValidationError') {
        res.render('error', {
          errors: err.errors,
          path: '/loans/'
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

//Return book
router.route('/:id')
.get(function(req, res, next) {
  console.log('Return the book: ' + req.params.id);
  var today = new Date().toISOString().substring(0, 10);
  
  db.Loan
    .findById(req.params.id, {
      include: [
        {
          model: db.Book
        },
        {
          model: db.Patron
        }
      ]
    })
    .then(function(loan) {
      if(loan) {
      res.render('return_book', { loan: loan, pageTitle: 'Return Book', returnDay: today });
    } else {
      var err = new Error('That item doesn\'t exist!');
      err.status = 404;
      res.render('error', {
        errors: [err],
        path: '/books/'
      })
    }
    })
    .catch(function(error) {
      console.log('there is error: ' + error);
      res.status(500).send(error);
    });
})
.post(function(req, res, next) {
  db.Loan
  .findById(req.params.id)
  .then(function (loan) {
    console.log(loan);
    if(loan) {
      return loan.update(req.body);
    } else {
      var err = new Error('That item doesn\'t exist!');
      err.status = 404;
      res.render('error', {
        errors: [err],
        path: '/books/'
      })
    }
  })
  .then(function() {
    res.redirect('/loans');
  })
  .catch(function(err) {
    if (err.name === 'SequelizeValidationError') {
      res.render('error', {
        errors: err.errors,
        path: '/loans/'
      });
    } else {
      throw err;
    }
  })
  .catch(function(err) {
    console.log('Error: ' + err);
    res.status(500).send(err);
  });
})  
module.exports = router;
