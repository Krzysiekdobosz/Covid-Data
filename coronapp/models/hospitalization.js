'use strict';
module.exports = (sequelize, DataTypes) => {
  const Hospitalization = sequelize.define('Hospitalization', {
    country: DataTypes.STRING,
    date: DataTypes.DATE,
    total_hospitalized: DataTypes.INTEGER,
    daily_hospitalized: DataTypes.INTEGER
  }, {});
  return Hospitalization;
};
