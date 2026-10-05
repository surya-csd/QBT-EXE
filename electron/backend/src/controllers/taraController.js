const taraService = require("../services/taraService");

const getAllTara = async (req, res) => {
    try {
        const taraList = await taraService.getAllTara();

        res.json(taraList);
    } catch (error) {
        console.error("Error fetching TARA:", error);

        res.status(500).json({
            message: "Failed to fetch TARA records",
        });
    }
};
const createTara = async (req, res) => {
    try {
        const tara = await taraService.createTara(req.body);

        res.status(201).json(tara);
    } catch (error) {
        console.error("Error creating TARA:", error);

        res.status(500).json({
            message: "Failed to create TARA",
        });
    }
};
const getTaraById = async (req, res) => {
    try {
        const tara = await taraService.getTaraById(req.params.id);

        if (!tara) {
            return res.status(404).json({
                message: "TARA not found",
            });
        }

        res.status(200).json(tara);
    } catch (error) {
        console.error("Error fetching TARA:", error);

        res.status(500).json({
            message: "Failed to fetch TARA",
        });
    }
};
const updateTara = async (req, res) => {
    try {
        const tara = await taraService.updateTara(
            req.params.id,
            req.body
        );

        if (!tara) {
            return res.status(404).json({
                message: "TARA not found",
            });
        }

        res.status(200).json(tara);

    } catch (error) {
        console.error("Error updating TARA:", error);

        res.status(500).json({
            message: "Failed to update TARA",
        });
    }
};
const deleteTara = async (req, res) => {
    try {
        const tara = await taraService.deleteTara(req.params.id);

        if (!tara) {
            return res.status(404).json({
                message: "TARA not found",
            });
        }

        res.status(200).json({
            message: "TARA deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting TARA:", error);

        res.status(500).json({
            message: "Failed to delete TARA",
        });
    }
};
module.exports = {
    getAllTara,
    createTara,
    getTaraById,
    updateTara,
    deleteTara,
};