const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaskRiskItem = sequelize.define(
    "TaskRiskItem",
    {
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            allowNull: false,
        },

        assessment_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },

        serial_no: {
            type: DataTypes.INTEGER,
        },

        description: {
            type: DataTypes.TEXT,
        },

        potential_hazard: {
            type: DataTypes.TEXT,
        },

        safe_practice: {
            type: DataTypes.TEXT,
        },

        initial_F: {
            type: DataTypes.INTEGER,
        },

        initial_D: {
            type: DataTypes.INTEGER,
        },

        initial_N: {
            type: DataTypes.INTEGER,
        },

        initial_C: {
            type: DataTypes.INTEGER,
        },

        initial_P: {
            type: DataTypes.INTEGER,
        },

        initial_C2: {
            type: DataTypes.INTEGER,
        },

        initial_PXC: {
            type: DataTypes.INTEGER,
        },

        action_required: {
            type: DataTypes.TEXT,
        },

        new_control_measures: {
            type: DataTypes.TEXT,
        },

        residual_P: {
            type: DataTypes.INTEGER,
        },

        residual_C: {
            type: DataTypes.INTEGER,
        },

        residual_PXC: {
            type: DataTypes.INTEGER,
        },

        date_completed: {
            type: DataTypes.DATEONLY,
        },

        current_risk_total: {
            type: DataTypes.INTEGER,
        },
    },
    {
        tableName: "task_risk_items",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    }
);

module.exports = TaskRiskItem;