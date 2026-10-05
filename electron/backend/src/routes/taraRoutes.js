const express = require("express");
const taraController = require("../controllers/taraController");

const router = express.Router();


router.get("/", taraController.getAllTara);
router.post("/", taraController.createTara);
router.get("/:id", taraController.getTaraById);
router.put("/:id", taraController.updateTara);
router.delete("/:id",taraController.deleteTara);

module.exports = router;