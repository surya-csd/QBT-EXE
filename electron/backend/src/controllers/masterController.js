const {
  getAllMasterData,
  getMasterDataById,
  updateMasterData,
  getMasterDataByType
} = require("../services/masterService");

const getAllMaster = async (req, res) => {
  try {
    const data = await getAllMasterData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get master data",
    });
  }
};

const getMasterById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getMasterDataById(id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Master data not found") {
      return res.status(404).json({
        success: false,
        message: "Master data not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to get master data",
    });
  }
};

const updateMaster = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await updateMasterData(id, req.body);

    res.status(200).json({
      success: true,
      message: "Master data updated successfully",
      data,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Master data not found") {
      return res.status(404).json({
        success: false,
        message: "Master data not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update master data",
    });
  }
};


// Get master data by type
const getMasterByType = async (req, res) => {
  try {
    const { type } = req.params;

    const data = await getMasterDataByType(type);

    res.status(200).json({
      success: true,
      type,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get master data by type",
    });
  }
};


module.exports = {
  getAllMaster,
  getMasterById,
  updateMaster,
  getMasterByType
};