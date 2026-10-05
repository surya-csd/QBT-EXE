const Master = require("../models/masterModel");

const getAllMasterData = async () => {
  return await Master.findAll({
    order: [["created_at", "DESC"]],
  });
};

const getMasterDataById = async (id) => {
  const master = await Master.findByPk(id);

  if (!master) {
    throw new Error("Master data not found");
  }

  return master;
};

const updateMasterData = async (id, data) => {
  const master = await Master.findByPk(id);

  if (!master) {
    throw new Error("Master data not found");
  }

  await master.update(data);

  return master;
};

// Get master data by type
const getMasterDataByType = async (type) => {
  const data = await Master.findAll({
    where: {
      type: type,
    },
    order: [["created_at", "DESC"]],
  });

  return data;
};

module.exports = {
  getAllMasterData,
  getMasterDataById,
  updateMasterData,
  getMasterDataByType
};