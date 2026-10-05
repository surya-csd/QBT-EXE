const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BillItem = sequelize.define(
  "BillItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    bill_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    serial_no: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    job_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    quantity: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: true,
    },

    unit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    rate: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "bill_items",
    timestamps: false,
  }
);

module.exports = BillItem;