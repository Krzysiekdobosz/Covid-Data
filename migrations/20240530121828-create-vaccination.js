'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vaccinations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      country: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      total_vaccinations: {
        type: Sequelize.INTEGER
      },
      people_vaccinated: {
        type: Sequelize.INTEGER
      },
      people_fully_vaccinated: {
        type: Sequelize.INTEGER
      },
      daily_vaccinations: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vaccinations');
  }
};