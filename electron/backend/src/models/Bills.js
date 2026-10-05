const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Bill = sequelize.define(
  "Bill",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    bill_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    quotation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    purchase_order_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    purchase_order_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    bill_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    subject: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    reference: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sac_no: {
      type: DataTypes.STRING(20),
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
    tableName: "bills",
    timestamps: false,
  }
);

module.exports = Bill;