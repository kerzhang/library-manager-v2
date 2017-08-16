var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

var PAGE_LIMIT = 6;
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

/* GET all loans record */
router.get('/', function(req, res) {
  var today = new Date().toISOString().substring(0, 10);

  db.Loan
    .findAll()
    .then(function(loans) {
      countTotalPagesAndLoans(loans);
    })
    .then(function() {
      if (req.query.filter === 'overdue') {
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
              }
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
      } else if (req.query.filter === 'checked_out') {
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
      } else if (req.query.page !== undefined) {
        let clickedPage = 1;
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

//Add new book
router.get('/new', function(req, res, next) {
  let allBooks = [];
  let allPatrons = [];
  db.Book.findAll().then(function(books) {
    allBooks = books;
    db.Patron
      .findAll()
      .then(function(patrons) {
        allPatrons = patrons;
      })
      .then(function() {
        var loanDate = new Date().toISOString();
        var today = new Date();
        var returnDate = new Date(
          today.setDate(today.getDate() + 7)
        ).toISOString();
        res.render('new_loan', {
          patron: db.Loan.build(),
          books: allBooks,
          patrons: allPatrons,
          loanDate: loanDate,
          returnDate: returnDate,
          pageTitle: 'New Loan'
        });
      });
  });
});

//Save new book
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

module.exports = router;
