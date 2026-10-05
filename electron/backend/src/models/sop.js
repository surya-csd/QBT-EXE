const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sop = sequelize.define(
    "Sop",
    {
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            allowNull: false,
        },

        task_risk_assessment_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },

        heading: {
            type: DataTypes.STRING(255),
        },

        points: {
            type: DataTypes.JSON,
            get() {
                const value = this.getDataValue("points");

                if (typeof value !== "string") {
                    return value;
                }

                try {
                    return JSON.parse(value);
                } catch (error) {
                    return value;
                }
            },
        },
    },
    {
        tableName: "sops",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Sop;