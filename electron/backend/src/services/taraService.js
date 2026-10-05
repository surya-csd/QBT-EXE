const { Op } = require("sequelize");
const { TaskRiskAssessment, TaskRiskItem, Sop } = require("../models");
const sequelize = require("../config/database");
const { randomUUID } = require("crypto");

const assessmentIncludes = [
    {
        association: "items",
        required: false,
    },
    {
        association: "sops",
        required: false,
    },
];

const valueOrNull = (value) => value === "" || value === undefined ? null : value;

const getAllTara = async () => {
    return await TaskRiskAssessment.findAll({
        include: assessmentIncludes,
    });
};

const saveChildren = async (assessmentId, taraData, transaction) => {
    const rows = Array.isArray(taraData.rows) ? taraData.rows : [];
    const sopSteps = Array.isArray(taraData.sopSteps) ? taraData.sopSteps : [];

    await TaskRiskItem.destroy({ where: { assessment_id: assessmentId }, transaction });
    await Sop.destroy({ where: { task_risk_assessment_id: assessmentId }, transaction });

    const items = rows
        .filter((row) => row && typeof row === "object")
        .filter((row) => Object.entries(row).some(([key, value]) =>
            key !== "id" && value !== undefined && value !== null && String(value).trim() !== ""
        ))
        .map((row, index) => ({
            id: randomUUID(),
            assessment_id: assessmentId,
            serial_no: index + 1,
            description: row.job || row.description || null,
            potential_hazard: row.hazard || row.potential_hazard || null,
            safe_practice: row.control || row.safe_practice || null,
            initial_F: valueOrNull(row.f ?? row.initial_F),
            initial_D: valueOrNull(row.d ?? row.initial_D),
            initial_N: valueOrNull(row.n ?? row.initial_N),
            initial_C: valueOrNull(row.c1 ?? row.initial_C),
            initial_P: valueOrNull(row.p ?? row.initial_P),
            initial_C2: valueOrNull(row.c2 ?? row.initial_C2),
            initial_PXC: valueOrNull(row.pxc ?? row.initial_PXC),
            action_required: row.actionReq ?? row.action_required ?? null,
            new_control_measures: row.newControlMeasures ?? row.new_control_measures ?? null,
            residual_P: valueOrNull(row.resF ?? row.residual_P),
            residual_C: valueOrNull(row.resC ?? row.residual_C),
            residual_PXC: valueOrNull(row.resPxc ?? row.residual_PXC),
            date_completed: row.date || row.date_completed || null,
            current_risk_total: valueOrNull(row.currentRisk ?? row.current_risk_total),
        }));

    const sops = sopSteps
        .filter((step) => step && (step.heading || step.instructions))
        .map((step) => ({
            id: randomUUID(),
            task_risk_assessment_id: assessmentId,
            heading: step.heading || null,
            points: String(step.instructions || "")
                .split(/\r?\n/)
                .map((point) => point.trim())
                .filter(Boolean),
        }));

    if (items.length > 0) {
        await TaskRiskItem.bulkCreate(items, { transaction });
    }
    if (sops.length > 0) {
        await Sop.bulkCreate(sops, { transaction });
    }
};

const getParentData = (taraData) => {
    const { rows, sopSteps, riskItems, risk_items, ...parentData } = taraData;
    return parentData;
};

const createTara = async (taraData) => {
    const transaction = await sequelize.transaction();
    try {
        const id = randomUUID();
        await TaskRiskAssessment.create({ id, ...getParentData(taraData) }, { transaction });
        await saveChildren(id, taraData, transaction);
        await transaction.commit();
        return await getTaraById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
const getTaraById = async (id) => {
    return await TaskRiskAssessment.findOne({
        where: {
            [Op.or]: [
                { id },
                { tara_no: id },
            ],
        },
        include: assessmentIncludes,
    });
};
const updateTara = async (id, taraData) => {

    const tara = await TaskRiskAssessment.findByPk(id);

    if (!tara) {
        return null;
    }

    const transaction = await sequelize.transaction();
    try {
        await tara.update(getParentData(taraData), { transaction });
        await saveChildren(tara.id, taraData, transaction);
        await transaction.commit();
        return await getTaraById(tara.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
const deleteTara = async (id) => {

    const tara = await TaskRiskAssessment.findByPk(id);

    if (!tara) {
        return null;
    }

    await tara.destroy();

    return tara;
};

module.exports = {
    getAllTara,
    createTara,
    getTaraById,
    updateTara,
    deleteTara,
};