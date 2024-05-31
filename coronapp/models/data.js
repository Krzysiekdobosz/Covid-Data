'use strict';
module.exports = (sequelize, DataTypes) => {
  const Data = sequelize.define('Data', {
    confirmed: DataTypes.INTEGER,
    deaths: DataTypes.INTEGER,
    recovered: DataTypes.INTEGER,
    date: DataTypes.DATE
  }, {});
  return Data;
};
