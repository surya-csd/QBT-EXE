const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Quotation = sequelize.define(
  "Quotation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    quotation_no: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    quotation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    subject: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sac_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    prq_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    work_completion_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    cgst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    sgst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    igst_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    grand_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    amount_in_words: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "quotations",
    timestamps: false,
  }
);

module.exports = Quotation;