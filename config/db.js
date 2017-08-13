'use strict'

const db = {};

db.Book = require('../models').Book;
db.Loan = require('../models').Loan;
db.Patron = require('../models').Patron;

db.Book.hasMany(db.Loan, {foreignKey: 'book_id', sourceKey: 'id'});
db.Patron.hasMany(db.Loan, {foreignKey: 'patron_id', sourceKey: 'id'});
db.Loan.belongsTo(db.Book, { foreignKey: 'book_id', sourceKey: 'id' });
db.Loan.belongsTo(db.Patron, { foreignKey: 'patron_id', sourceKey: 'id' });

module.exports = db;