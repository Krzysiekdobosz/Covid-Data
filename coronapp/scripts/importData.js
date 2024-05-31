const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('coronadb', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql'
});
const Vaccination = require('../models/vaccination')(sequelize, DataTypes);
const Hospitalization = require('../models/hospitalization')(sequelize, DataTypes);

// const importCSV = (filePath, model) => {
//   return new Promise((resolve, reject) => {
//     const results = [];
//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on('data', (data) => results.push(data))
//       .on('end', async () => {
//         try {
//           await model.bulkCreate(results);
//           resolve();
//         } catch (error) {
//           reject(error);
//         }
//       });
//   });
// };
const CHUNK_SIZE = 500;

const importCSV = (filePath, model) => {
  return new Promise((resolve, reject) => {
    let results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
        if (results.length === CHUNK_SIZE) {
          model.bulkCreate(results);
          results = [];
        }
      })
      .on('end', async () => {
        try {
          if (results.length > 0) {
            await model.bulkCreate(results);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
};

const importData = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    await importCSV(path.join(__dirname, '../data/vaccinations.csv'), Vaccination);
    await importCSV(path.join(__dirname, '../data/covid-hospitalizations.csv'), Hospitalization);

    console.log('Data successfully imported.');
    await sequelize.close();
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

importData();
