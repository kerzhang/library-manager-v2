'use strict';
module.exports = function(sequelize, DataTypes) {
  var Loan = sequelize.define(
    'Loan',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      book_id: DataTypes.INTEGER, 
      patron_id: DataTypes.INTEGER,
      loaned_on: DataTypes.DATE,
      return_by: DataTypes.DATE,
      returned_on: DataTypes.DATE
    },
    {
      classMethods: {
        associate: function(models) {
          Loan.belongsTo(models.Book, { foreignKey: 'book_id', targetKey: 'id' });
          Loan.hasOne(models.Patron, { foreignKey: 'patron_id', targetKey: 'id' });
        }
      },
      timestamps: false
    });
  return Loan;
};
