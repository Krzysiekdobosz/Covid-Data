const { Sequelize, DataTypes } = require('sequelize');
const { databaseUrl } = require('./config');

const sequelize = new Sequelize(databaseUrl, { logging: false });

const Vaccination = sequelize.define('Vaccination', {
  isoCode: { type: DataTypes.STRING(12), allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  totalVaccinations: DataTypes.BIGINT,
  peopleVaccinated: DataTypes.BIGINT,
  peopleFullyVaccinated: DataTypes.BIGINT,
  totalBoosters: DataTypes.BIGINT,
  dailyVaccinations: DataTypes.INTEGER,
  peopleVaccinatedPerHundred: DataTypes.FLOAT,
  peopleFullyVaccinatedPerHundred: DataTypes.FLOAT,
  totalBoostersPerHundred: DataTypes.FLOAT,
  dailyVaccinationsPerMillion: DataTypes.FLOAT,
}, {
  timestamps: false,
  indexes: [{ fields: ['isoCode', 'date'] }],
});

const Hospitalization = sequelize.define('Hospitalization', {
  isoCode: { type: DataTypes.STRING(12), allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  indicator: { type: DataTypes.STRING, allowNull: false },
  value: DataTypes.FLOAT,
}, {
  timestamps: false,
  indexes: [{ fields: ['isoCode', 'indicator', 'date'] }],
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const WatchlistItem = sequelize.define('WatchlistItem', {
  isoCode: { type: DataTypes.STRING(12), allowNull: false },
}, {
  indexes: [{ unique: true, fields: ['UserId', 'isoCode'] }],
});

User.hasMany(WatchlistItem, { onDelete: 'CASCADE' });
WatchlistItem.belongsTo(User);

module.exports = { sequelize, Vaccination, Hospitalization, User, WatchlistItem };
