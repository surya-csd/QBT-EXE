const sopService = require("../services/sopService");

const getSopsByAssessmentId = async (req, res) => {
    try {
        const sops = await sopService.getSopsByAssessmentId(
            req.params.task_risk_assessment_id
        );

        res.status(200).json(sops);
    } catch (error) {
        console.error("Error fetching SOPs:", error);

        res.status(500).json({
            message: "Failed to fetch SOPs",
        });
    }
};

const createSop = async (req, res) => {
    try {
        const sop = await sopService.createSop(req.body);

        res.status(201).json(sop);
    } catch (error) {
        console.error("Error creating SOP:", error);

        res.status(500).json({
            message: "Failed to create SOP",
        });
    }
};

const getSopById = async (req, res) => {
    try {
        const sop = await sopService.getSopById(req.params.id);

        if (!sop) {
            return res.status(404).json({
                message: "SOP not found",
            });
        }

        res.status(200).json(sop);
    } catch (error) {
        console.error("Error fetching SOP:", error);

        res.status(500).json({
            message: "Failed to fetch SOP",
        });
    }
};

const updateSop = async (req, res) => {
    try {
        const sop = await sopService.updateSop(
            req.params.id,
            req.body
        );

        if (!sop) {
            return res.status(404).json({
                message: "SOP not found",
            });
        }

        res.status(200).json(sop);
    } catch (error) {
        console.error("Error updating SOP:", error);

        res.status(500).json({
            message: "Failed to update SOP",
        });
    }
};

const deleteSop = async (req, res) => {
    try {
        const sop = await sopService.deleteSop(req.params.id);

        if (!sop) {
            return res.status(404).json({
                message: "SOP not found",
            });
        }

        res.status(200).json({
            message: "SOP deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting SOP:", error);

        res.status(500).json({
            message: "Failed to delete SOP",
        });
    }
};
module.exports = {
    getSopsByAssessmentId,
    createSop,
    getSopById,
    updateSop,
    deleteSop,
};