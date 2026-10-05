const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Master = sequelize.define(
  "Master",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    vendorNo: {
      type: DataTypes.STRING(50),
      field: "vendor_no",
    },

    gstNo: {
      type: DataTypes.STRING(50),
      field: "gst_no",
    },

    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    through: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    cgstRate: {
      type: DataTypes.DECIMAL(5, 2),
      field: "cgst_rate",
      defaultValue: 0,
    },

    sgstRate: {
      type: DataTypes.DECIMAL(5, 2),
      field: "sgst_rate",
      defaultValue: 0,
    },

    igstRate: {
      type: DataTypes.DECIMAL(5, 2),
      field: "igst_rate",
      defaultValue: 0,
    },
  },
  {
    tableName: "master",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Master;