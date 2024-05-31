'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vaccination = sequelize.define('Vaccination', {
    country: DataTypes.STRING,
    date: DataTypes.DATE,
    total_vaccinations: DataTypes.INTEGER,
    people_vaccinated: DataTypes.INTEGER,
    people_fully_vaccinated: DataTypes.INTEGER,
    daily_vaccinations: DataTypes.INTEGER
  }, {});
  return Vaccination;
};
