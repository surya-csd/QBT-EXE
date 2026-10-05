const { Op } = require("sequelize");
const { TaskRiskAssessment, TaskRiskItem } = require("../models");
const { randomUUID } = require("crypto");

const getItemsByAssessmentId = async (assessment_id) => {
    const assessment = await TaskRiskAssessment.findOne({
        attributes: ["id"],
        where: {
            [Op.or]: [
                { id: assessment_id },
                { tara_no: assessment_id },
            ],
        },
    });

    if (!assessment) {
        return [];
    }

    return await TaskRiskItem.findAll({
        where: { assessment_id: assessment.id },
    });
};

const createTaskRiskItem = async (itemData) => {
    return await TaskRiskItem.create({
        id: randomUUID(),
        ...itemData,
    });
};

const getTaskRiskItemById = async (id) => {
    console.log("Searching risk item ID:", id);

    const item = await TaskRiskItem.findOne({
        where: {
            id: id,
        },
    });

    console.log("Found risk item:", item ? item.toJSON() : null);

    return item;
};

const updateTaskRiskItem = async (id, itemData) => {
    const item = await TaskRiskItem.findByPk(id);

    if (!item) {
        return null;
    }

    await item.update(itemData);

    return item;
};

const deleteTaskRiskItem = async (id) => {
    const item = await TaskRiskItem.findByPk(id);

    if (!item) {
        return null;
    }

    await item.destroy();

    return item;
};

module.exports = {
    getItemsByAssessmentId,
    createTaskRiskItem,
    getTaskRiskItemById,
    updateTaskRiskItem,
    deleteTaskRiskItem,
};