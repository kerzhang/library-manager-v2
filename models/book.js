'use strict';
module.exports = function(sequelize, DataTypes) {
  var Book = sequelize.define(
    'Book',
    {
      // id: { type: DataTypes.INTEGER, primaryKey: true },
      title: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'Please input a valid book title.'
          }
        }
      },
      author: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'Please input a valid author name.'
          }
        }
      },
      genre: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: 'Please input a valid book genre.'
          }
        }
      },
      first_published: {
        type: DataTypes.INTEGER,
        // validate: {
        //   isInt: {
        //     msg: 'Please input an integer number for the published year.'
        //   }
        // }
      }
    },
    {
      classMethods: {
        associate: function(models) {
          // Book.hasMany(models.Loan, {foreignKey: 'book_id', sourceKey: 'id'});
        }
      },
      timestamps: false
    }
  );
  return Book;
};
