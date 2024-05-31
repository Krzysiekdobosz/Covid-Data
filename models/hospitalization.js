'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hospitalization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Hospitalization.init({
    country: DataTypes.STRING,
    date: DataTypes.DATE,
    total_hospitalized: DataTypes.INTEGER,
    daily_hospitalized: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Hospitalization',
  });
  return Hospitalization;
};