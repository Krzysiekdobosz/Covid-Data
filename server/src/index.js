const { port } = require('./config');
const { sequelize } = require('./db');
const app = require('./app');

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Could not connect to the database:', error.message);
    process.exit(1);
  });
