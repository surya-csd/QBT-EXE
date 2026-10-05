const { Op } = require("sequelize");
const { Sop, TaskRiskAssessment } = require("../models");
const { randomUUID } = require("crypto");

const getSopsByAssessmentId = async (task_risk_assessment_id) => {
    const assessment = await TaskRiskAssessment.findOne({
        attributes: ["id"],
        where: {
            [Op.or]: [
                { id: task_risk_assessment_id },
                { tara_no: task_risk_assessment_id },
            ],
        },
    });

    if (!assessment) {
        return [];
    }

    return await Sop.findAll({
        where: { task_risk_assessment_id: assessment.id },
    });
};

const createSop = async (sopData) => {
    return await Sop.create({
        id: randomUUID(),
        ...sopData,
    });
};

const getSopById = async (id) => {
    return await Sop.findByPk(id);
};

const updateSop = async (id, sopData) => {
    const sop = await Sop.findByPk(id);

    if (!sop) {
        return null;
    }

    await sop.update(sopData);

    return sop;
};

const deleteSop = async (id) => {
    const sop = await Sop.findByPk(id);

    if (!sop) {
        return null;
    }

    await sop.destroy();

    return sop;
};

module.exports = {
    getSopsByAssessmentId,
    createSop,
    getSopById,
    updateSop,
    deleteSop,
};