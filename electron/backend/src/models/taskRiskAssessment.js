const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaskRiskAssessment = sequelize.define(
    "TaskRiskAssessment",
    {
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            allowNull: false,
        },

        tara_no: {
            type: DataTypes.STRING(50),
        },

        site: {
            type: DataTypes.STRING(200),
        },

        department: {
            type: DataTypes.STRING(200),
        },

        machine_area: {
            type: DataTypes.STRING(200),
        },

        task_description: {
            type: DataTypes.TEXT,
        },

        performing_task: {
            type: DataTypes.TEXT,
        },

        others_at_risk: {
            type: DataTypes.TEXT,
        },

        tara_team: {
            type: DataTypes.JSON,
            get() {
                const value = this.getDataValue("tara_team");

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

        task_risk_score: {
            type: DataTypes.INTEGER,
        },

        assessment_date: {
            type: DataTypes.DATEONLY,
        },

        revision_no: {
            type: DataTypes.INTEGER,
        },

        revision_date: {
            type: DataTypes.DATEONLY,
        },

        next_revision_date: {
            type: DataTypes.DATEONLY,
        },
    },
    {
        tableName: "task_risk_assessments",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = TaskRiskAssessment;