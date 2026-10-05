const path = require("path");
const { Sequelize } = require("sequelize");
const dbPath = process.env.QBT_DB_PATH || path.join(__dirname, "..", "..", "qbt.db");
const sequelize = new Sequelize({ dialect: "sqlite", storage: dbPath, logging: false });
module.exports = sequelize;
