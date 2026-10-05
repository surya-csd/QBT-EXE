const express = require("express");

const {
  getAllMaster,
  getMasterById,
  updateMaster,
  getMasterByType
} = require("../controllers/masterController");

const router = express.Router();

router.get("/", getAllMaster);

router.get("/type/:type", getMasterByType);

router.get("/:id", getMasterById);

router.put("/:id", updateMaster);

module.exports = router;