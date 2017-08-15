'use strict';
module.exports = function(sequelize, DataTypes) {
  var Loan = sequelize.define(
    'Loan',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      book_id: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: {
            msg: 'Please select a book.'
          }
        }
      },
      patron_id: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: {
            msg: 'Please select a patron.'
          }
        }
      },
      loaned_on: {
        type: DataTypes.DATE,
        validate: {
          notEmpty: {
            msg: 'Loan date is required.'
          }
        }
      },
      return_by: {
        type: DataTypes.DATE,
        validate: {
          notEmpty: {
            msg: 'Return date is required.'
          }
        }
      },
      returned_on: DataTypes.DATE
    },
    {
      classMethods: {
        associate: function(models) {
          Loan.belongsTo(models.Book, {
            foreignKey: 'book_id',
            targetKey: 'id'
          });
          Loan.hasOne(models.Patron, {
            foreignKey: 'patron_id',
            targetKey: 'id'
          });
        }
      },
      timestamps: false
    }
  );
  return Loan;
};
