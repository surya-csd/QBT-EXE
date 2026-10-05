const express = require("express");

const {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
} = require("../controllers/billController");

const router = express.Router();

router.post("/", createBill);
router.get("/", getBills);
router.get("/:id", getBillById);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

module.exports = router;