var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

/* GET all loans record */
router.get('/', function(req, res) {
  db.Loan.findAll({
      include: [
        { 
          model: db.Book
        },
        { 
          model: db.Patron 
        }
      ]
    }).then(function(loans) {
      res.render('all_loans', { 
        loans: loans,
        pageTitle: 'Loan Records' 
      });
      // console.log(loans);
    })
    .catch(function(error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

//Add new book
router.get('/new', function(req, res, next) {
  res.render('new_loan', {
    patron: db.Loan.build(), 
    pageTitle: 'New Loan' 
  });
});

//Save new book
router.post('/', function(req, res, next) {
  console.log(req.body);
  db.Loan.create(req.body).then(function(book) {
    res.redirect('/loans');
  });
});

module.exports = router;
