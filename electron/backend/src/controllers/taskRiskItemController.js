const taskRiskItemService = require("../services/taskRiskItemService");

const getItemsByAssessmentId = async (req, res) => {
    try {
        const items = await taskRiskItemService.getItemsByAssessmentId(
            req.params.assessment_id
        );

        res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching risk items:", error);

        res.status(500).json({
            message: "Failed to fetch risk items",
        });
    }
};

const createTaskRiskItem = async (req, res) => {
    try {
        const item = await taskRiskItemService.createTaskRiskItem(req.body);

        res.status(201).json(item);
    } catch (error) {
        console.error("Error creating risk item:", error);

        res.status(500).json({
            message: "Failed to create risk item",
        });
    }
};

const getTaskRiskItemById = async (req, res) => {
    try {
        const item = await taskRiskItemService.getTaskRiskItemById(
            req.params.id
        );

        if (!item) {
            return res.status(404).json({
                message: "Risk item not found",
            });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error("Error fetching risk item:", error);

        res.status(500).json({
            message: "Failed to fetch risk item",
        });
    }
};

const updateTaskRiskItem = async (req, res) => {
    try {
        const item = await taskRiskItemService.updateTaskRiskItem(
            req.params.id,
            req.body
        );

        if (!item) {
            return res.status(404).json({
                message: "Risk item not found",
            });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error("Error updating risk item:", error);

        res.status(500).json({
            message: "Failed to update risk item",
        });
    }
};

const deleteTaskRiskItem = async (req, res) => {
    try {
        const item = await taskRiskItemService.deleteTaskRiskItem(
            req.params.id
        );

        if (!item) {
            return res.status(404).json({
                message: "Risk item not found",
            });
        }

        res.status(200).json({
            message: "Risk item deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting risk item:", error);

        res.status(500).json({
            message: "Failed to delete risk item",
        });
    }
};

module.exports = {
    getItemsByAssessmentId,
    createTaskRiskItem,
    getTaskRiskItemById,
    updateTaskRiskItem,
    deleteTaskRiskItem,
};