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
  console.log(req.body);
  db.Patron.create(req.body).then(function(book) {
    res.redirect('/patrons');
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
      res.redirect('/patrons/' + patron.id);
    })
    .catch(function(error) {
      // TODO: DATA VALIDATION AND ERROR HANDLE
      console.log(error);
      res.status(500).send(error);
    });
});
//Get patron detials.
/* router.get('/:id', function(req, res) {
  db.Patron.findById(req.params.id, {
    include: [
      {
        model : db.Loan,
      }
    ]
  }).then(function (patron) {
    var patronObj = Object.assign(
        {},
        {
          patronFirstName : patron.first_name,
          patronLastName: patron.last_name,
          patronAddress : patron.address,
          patronEmail : patron.email,
          patronLibraryId : patron.library_id,
          patronZip : patron.zip_code,
          patronLoans : patron.Loans.map(function (loan) {
            //FIXME: Find a way to fetch the patron name.
            return Object.assign(
              {},
              {
                loanId : loan.id,
                loanBook : loan.book_id,
                loanedOn : loan.loaned_on,
                loanReturnBy : loan.return_by,
                loanReturnOn : loan.returned_on,
                loanPatronId : loan.patron_id,
                // loanPatron : patronName
              }
            );
          })
        }
      )
      res.render('patron_detail', { patron: patronObj, pageTitle: 'Patron Detail' });
      console.log(patronObj);
  }).catch(function(error) {
    console.log(error);
    res.status(500).send(error);
  });
  
}); */
router.get('/:id', function(req, res) {
  db.Patron.findById(req.params.id).then(function(patron) {
    db.Loan.findAll({
      include: [
        {
          model: db.Book
        },
        // {
        //   model: db.Patron
        // }
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
  });
});



module.exports = router;
