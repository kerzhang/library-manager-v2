'use strict';
module.exports = function(sequelize, DataTypes) {
  var Book = sequelize.define('Book', {
    id: {type:DataTypes.INTEGER,primaryKey: true},
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    genre: DataTypes.STRING,
    first_published: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Book.hasMany(models.Loan, {foreignKey: 'book_id', sourceKey: 'id'});
        // Book.hasMany(models.Loan);
      }
    },
    timestamps: false
  });
  return Book;
};