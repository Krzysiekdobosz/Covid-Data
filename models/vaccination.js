'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vaccination extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Vaccination.init({
    country: DataTypes.STRING,
    date: DataTypes.DATE,
    total_vaccinations: DataTypes.INTEGER,
    people_vaccinated: DataTypes.INTEGER,
    people_fully_vaccinated: DataTypes.INTEGER,
    daily_vaccinations: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Vaccination',
  });
  return Vaccination;
};