var express = require('express');
var router = express.Router();
var Loan = require('../models/').Loan;
var Book = require('../models/').Book;

/* GET all loans record */
router.get('/', function(req, res) {
  Loan.findAll(
    {
         order: [['id', 'DESC']]
    },
    {
      include: [
        { model: Book},
        // { model: Patron }
      ]
    }
  )
    .then(function(loans) {
        // let nameOfBooks = [];
        // for (var index = 0; index < loans.length; index++) {
        //     Book.findById(loans[index])
        // }
      res.render('all_loans', { loans: loans, pageTitle: 'Loan Records List' });
      console.log(loans);
    })
    .catch(function(error) {
      console.log(error);
      res.status(500).send(error);
    });
});

module.exports = router;
