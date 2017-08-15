var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

/* GET all loans record */
router.get('/', function(req, res) {

  var today = new Date().toISOString().substring(0,10);
  
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
            return_by : { 
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
      ]
    })
    .then(function(loans) {
      res.render('all_loans', {
        loans: loans,
        pageTitle: 'Loan Records'
      });
      // console.log(loans);
    })
    .catch(function(error) {
      // console.log(error);
      res.status(500).send(error);
    });}
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
        var returnDate = (new Date(today.setDate(today.getDate() + 7))).toISOString();
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
  db.Loan.create(req.body).then(function() {
    res.redirect('/loans');
  }).catch(function(err) {
    if(err.name === 'SequelizeValidationError') {
      res.render('error', {
        errors: err.errors,
        path: '/loans/'
      })
    } else {
      throw err;
    }
  }).catch(function(err) {
    console.log("Error: " + err);
    res.status(500).send(err);
  });
});

module.exports = router;
