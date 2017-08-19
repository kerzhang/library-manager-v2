var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

/* GET patron listing. */
router.get('/', function(req, res) {
  db.Patron.findAll()
    .then(function(patrons) {
      res.render('all_patrons', { patrons: patrons, pageTitle: 'Patron List' });
      console.log('patrons are : ' + patrons);
    })
    .catch(function(error) {
      console.log(error);
      res.status(500).send(error);
    });
});

//Add new book
router.get('/new', function(req, res, next) {
  res.render('new_patron', {
    patron: db.Patron.build(), 
    pageTitle: 'New Patron' 
  });
});

//Save new book
router.post('/', function(req, res, next) {
  // console.log(req.body);
  db.Patron.create(req.body).then(function() {
    res.redirect('/patrons');
  }).catch(function(err) {
    if(err.name === 'SequelizeValidationError') {
      res.render('new_patron', {
        patron: db.Patron.build(req.body),
        errors: err.errors
      })
    } else {
      throw err;
    }
  }).catch(function(err) {
    console.log("Error: " + err);
    res.status(500).send(err);
  });
});

//Update book information
router.post('/:id', function(req, res, next) {
  db.Patron.findById(req.params.id)
    .then(function(patron) {
      if (patron) {
        console.log(req.body);
        return patron.update(req.body);
      } else {
        res.send(404);
      }
    })
    .then(function(patron) {
      res.redirect('/patrons');
    })
    .catch(function(error) {
      // TODO: DATA VALIDATION AND ERROR HANDLE
      console.log(error);
      res.status(500).send(error);
    });
});

router.get('/:id', function(req, res) {
  db.Patron.findById(req.params.id).then(function(patron) {
    if (patron) {
      db.Loan.findAll({
        include: [
          {
            model: db.Book
          }
        ],
        where: {
          patron_id: patron.id
        }
      })
        .then(function(loans) {
          if (loans) {
            // console.log(loans);
            res.render('patron_detail', {
              patron: patron,
              loans: loans,
              pageTitle: 'Patron Detail'
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
      var err = new Error('The patron doesn\'t exist!');
      err.status = 404;
      res.render('error', {
        errors: [err],
        path: '/books/'
      })
    }

  });
});



module.exports = router;
